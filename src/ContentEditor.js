import React from "react"
import { mixins } from "quick-n-dirty-react"
import ListContentEditor from "./ListContentEditor"
import ContentMetaForm from "./ContentMetaForm"

const style = {
    form: {
        width: "500px",
    },
    textInput: {
        ...mixins.textInput,
        minHeight: "75px",
        fontFamily: "Arial",
        background: "#f9f9f9",
        padding: "5px",
    },
}

const toCapital = string => `${string[0].toUpperCase()}${string.slice(1)}`

class ContentEditor extends React.Component {
    constructor(props) {
        super(props)

        this.fields = {}

        this.save = this.save.bind(this)
        this.cancel = this.cancel.bind(this)
    }

    cancel() {
        this.props.submit(null)
    }

    save() {
        const content = { ...this.props.content } // this'll inherit the _id, which determines save or create later
        // read meta fields
        content.label = this.meta.getLabel()
        content.references = this.meta.getReferences()

        // read field contents
        Object.keys(this.fields).forEach(field => {
            content.content[field] = this.fields[field].value
        })
        // call save of the parent
        this.props.submit(content)
    }

    render() {
        const contentType = this.props.contentTypes[this.props.content.contentType]

        if (contentType.list === true) {
            // that's lists done
            return (
                <ListContentEditor
                    contentType={contentType}
                    content={this.props.content}
                    submit={this.props.submit}
                    references={this.props.references}
                />
            )
        }

        // normal content

        return (
            <div>
                <div style={style.form}>
                    <ContentMetaForm
                        content={this.props.content}
                        references={this.props.references}
                        ref={el => {
                            this.meta = el
                        }}
                    />
                    {contentType.fields.map(field => (
                        <div key={field}>
                            <label htmlFor={`field-${field}`} style={mixins.label}>
                                {toCapital(field)}
                            </label>
                            <textarea
                                id={`field-${field}`}
                                defaultValue={this.props.content.content[field]}
                                style={style.textInput}
                                ref={el => {
                                    this.fields[field] = el
                                }}
                            />
                        </div>
                    ))}
                </div>
                {/* submit */}
                <div style={mixins.buttonLine}>
                    <button type="button" style={mixins.button} onClick={this.save}>
                        {this.props.content._id == null ? "Create" : "Update"}
                    </button>
                    <button type="button" style={mixins.inverseButton} onClick={this.cancel}>
                        Cancel
                    </button>
                </div>
            </div>
        )
    }
}

export default ContentEditor
