import React from "react"
import { util } from "quick-n-dirty-utils"
import { mixins, NotificationBar, Popup } from "quick-n-dirty-react"
import ContentEditor from "./ContentEditor"
import ContentHandler from "./ContentHandler"

const style = {
    deleteIcon: {
        ...mixins.red,
        ...mixins.clickable,
        fontWeight: "600",
        padding: "2px 5px",
    },
    listHeader: {
        fontSize: "12px",
        fontWeight: "600",
        borderBottom: "1px solid #333",
        padding: "8px",
        background: "#ccc",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "650px 40px 160px",
        gridRowGap: "6px",
    },
    formHook: {
        width: "350px",
        padding: "20px 0px",
    },
    reference: {
        ...mixins.smallFont,
        paddingLeft: "20px",
        display: "inline-block",
        margin: "0",
    },
}

class ContentManager extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            contentList: {},
            deleteContentId: null,
            currentContent: null,
        }
        this.getApiPrefix = this.getApiPrefix.bind(this)
        this.askDeleteContent = this.askDeleteContent.bind(this)
        this.confirmDeleteContent = this.confirmDeleteContent.bind(this)
        this.showNewContent = this.showNewContent.bind(this)
        this.editContent = this.editContent.bind(this)
        this.saveContent = this.saveContent.bind(this)

        this.contentHandler = new ContentHandler(this.getApiPrefix())
    }

    componentDidMount() {
        this.contentHandler
            .getContentList()
            .then(contentList => {
                const content = {}
                contentList.forEach(item => {
                    content[item._id] = item
                })
                this.setState({
                    contentList: content,
                })
            })
            .catch(() => {
                this.alert.error("Error loading content list")
            })
    }

    getApiPrefix() {
        return this.props.apiPrefix || "/api/content"
    }

    askDeleteContent(contentId) {
        return () => {
            this.setState({
                deleteContentId: contentId,
            })
        }
    }

    confirmDeleteContent() {
        fetch(`${this.getApiPrefix()}/${this.state.deleteContentId}`, {
            method: "DELETE",
            headers: util.getAuthJsonHeader(),
        })
            .then(util.restHandler)
            .then(response => {
                if (response.deleted) {
                    this.alert.success("Content deleted")
                } else {
                    this.alert.info("Content not deleted")
                }
                this.setState(oldState => {
                    const contentList = { ...oldState.contentList }
                    delete contentList[oldState.deleteContentId]
                    return {
                        deleteContentId: null,
                        contentList,
                    }
                })
            })
            .catch(() => {
                this.alert.error("Error deleting content")
            })
    }

    showNewContent(ev) {
        const selectedType = ev.target.value
        if (selectedType == null) {
            return
        }

        const contentType = this.props.contentTypes[selectedType]
        const newContent = {
            contentType: selectedType,
            references: [],
        }

        if (contentType.list) {
            newContent.content = []
        } else {
            newContent.content = {}
            contentType.fields.forEach(field => {
                newContent.content[field] = ""
            })
        }

        this.setState({
            currentContent: newContent,
        })
    }

    editContent(contentId) {
        return () => {
            this.setState({
                currentContent: null,
            })

            setTimeout(() => {
                if (contentId == null) {
                    this.setState({
                        currentContent: null,
                    })
                    return
                }

                this.setState(oldState => ({
                    ...oldState,
                    currentContent: { ...oldState.contentList[contentId] },
                }))
            }, 200)
        }
    }

    saveContent(content) {
        if (content == null) {
            // that's the cancel button
            this.setState({
                currentContent: null,
            })
            return
        }

        if (content.label.trim() === "") {
            this.alert.info("Please provide a label")
            return
        }

        // new
        let promise
        const isCreate = content._id == null
        if (isCreate) {
            // new entry
            promise = fetch(this.getApiPrefix(), {
                method: "POST",
                headers: util.getAuthJsonHeader(),
                body: JSON.stringify(content),
            }).then(util.restHandler)
        } else {
            // update existing
            promise = fetch(`${this.getApiPrefix()}/${content._id}`, {
                method: "POST",
                headers: util.getAuthJsonHeader(),
                body: JSON.stringify(content),
            }).then(util.restHandler)
        }

        promise
            .then(newItem => {
                this.setState(oldState => {
                    const contentList = { ...oldState.contentList }
                    contentList[newItem._id] = newItem
                    return {
                        ...oldState,
                        contentList,
                        currentContent: null,
                    }
                })

                this.alert.success(`Content ${isCreate ? "created" : "updated"}`)
            })
            .catch(() => {
                this.alert.error(`Content ${isCreate ? "creation" : "update"} failed`)
            })
    }

    render() {
        return (
            <div>
                <NotificationBar
                    ref={el => {
                        this.alert = el
                    }}
                />
                <div style={mixins.buttonLine}>
                    {this.state.currentContent == null ? (
                        <div style={style.formHook}>
                            <select
                                style={mixins.textInput}
                                onChange={this.showNewContent}
                                ref={el => {
                                    this.newContent = el
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Create new Content
                                </option>
                                {Object.keys(this.props.contentTypes).map(dataTypeKey => (
                                    <option value={dataTypeKey} key={dataTypeKey}>
                                        {dataTypeKey} ({this.props.contentTypes[dataTypeKey].fields.join(", ")})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <ContentEditor
                            content={this.state.currentContent}
                            contentTypes={this.props.contentTypes}
                            references={this.props.references}
                            submit={this.saveContent}
                        />
                    )}
                </div>
                <div style={style.grid}>
                    <div style={style.listHeader}>Label</div>
                    <div style={style.listHeader} />
                    <div style={style.listHeader}>Type</div>
                    {Object.values(this.state.contentList)
                        .sort((a, b) => (a.contentType || "").localeCompare(b.contentType))
                        .map(content => [
                            <div key="label" style={mixins.textLink} onClick={this.editContent(content._id)}>
                                {content.label}
                                <pre style={style.reference}>{(content.references || []).join(", ")}</pre>
                            </div>,
                            <div key="delete" style={mixins.center}>
                                <span style={style.deleteIcon} onClick={this.askDeleteContent(content._id)}>
                                    &times;
                                </span>
                            </div>,
                            <div key="type">{content.contentType}</div>,
                        ])}
                </div>

                {this.state.deleteContentId != null ? (
                    <Popup
                        title="Delete Content"
                        yes={this.confirmDeleteContent}
                        no={this.askDeleteContent(null)}
                        cancel={this.askDeleteContent(null)}
                    >
                        Are you sure you want to delete this content?
                    </Popup>
                ) : null}
            </div>
        )
    }
}

export default ContentManager
