import React from "react"
import { mixins } from "quick-n-dirty-react"
import ContentMetaForm from "./ContentMetaForm"

const style = {
    form: {
        width: "850px",
    },
    list: columns => ({
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridColumnGap: "2px",
    }),
    listHeader: {
        fontSize: "12px",
        fontWeight: "600",
        borderBottom: "1px solid #333",
        padding: "8px",
        background: "#ccc",
    },
    addIcon: {
        ...mixins.clickable,
        padding: "5px 10px",
        fontWeight: "600",
        border: "1px solid #3a3",
        borderRadius: "15px",
        color: "#3a3",
        display: "inline-block",
    },
    deleteRowIcon: {
        ...mixins.clickable,
        position: "absolute",
        right: "5px",
        top: "4px",
        fontWeight: "600",
        padding: "2px 9px",
        border: "1px solid #900",
        color: "#900",
        borderRadius: "15px",
    },
}

const toCapital = string => `${string[0].toUpperCase()}${string.slice(1)}`
const randomKey = () => `${new Date().getTime()}${Math.random()}`

class ListContentEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            rows: {},
        }

        this.addRow = this.addRow.bind(this)
        this.deleteRow = this.deleteRow.bind(this)
        this.save = this.save.bind(this)
        this.cancel = this.cancel.bind(this)
        this.updateField = this.updateField.bind(this)
    }

    componentDidMount() {
        const rows = {}
        this.props.content.content.forEach(row => {
            const stateRow = { ...row }
            stateRow.CURRENT_ROW_ID = randomKey()
            rows[stateRow.CURRENT_ROW_ID] = stateRow
        })
        this.setState({ rows })
    }

    cancel() {
        this.props.submit(null)
    }

    save() {
        const content = { ...this.props.content } // this'll inherit the _id, which determines save or create later
        // read meta fields
        content.label = this.meta.getLabel()
        content.references = this.meta.getReferences()

        // read rows
        content.content = []
        Object.values({ ...this.state.rows }).forEach(row => {
            delete row.CURRENT_ROW_ID
            content.content.push(row)
        })

        // call save of the parent
        this.props.submit(content)
    }

    addRow() {
        const newItem = {
            CURRENT_ROW_ID: randomKey(), // hopefully never overlaps with a column name
        }
        this.props.contentType.fields.forEach(field => {
            newItem[field] = ""
        })
        this.setState(oldState => {
            const rows = { ...oldState.rows }
            rows[newItem.CURRENT_ROW_ID] = newItem
            return {
                ...oldState,
                rows,
            }
        })
    }

    deleteRow(key) {
        return () => {
            this.setState(oldState => {
                const rows = { ...oldState.rows }
                delete rows[key]
                return {
                    ...oldState,
                    rows,
                }
            })
        }
    }

    updateField(rowId, field) {
        return ev => {
            ev.persist()
            this.setState(oldState => {
                const rows = { ...oldState.rows }
                rows[rowId][field] = ev.target.value
                return {
                    ...oldState,
                    rows,
                }
            })
        }
    }

    render() {
        return (
            <div style={style.form}>
                <ContentMetaForm
                    content={this.props.content}
                    ref={el => {
                        this.meta = el
                    }}
                    references={this.props.references}
                />
                <div style={style.list(this.props.contentType.fields.length)}>
                    {this.props.contentType.fields.map(field => (
                        <div key={field} style={style.listHeader}>
                            {toCapital(field)}
                        </div>
                    ))}
                </div>
                {Object.values(this.state.rows).map(row => (
                    <div style={style.list(this.props.contentType.fields.length)} key={row.CURRENT_ROW_ID}>
                        {this.props.contentType.fields.map(field => (
                            <div key={field} style={mixins.relative}>
                                <input
                                    type="text"
                                    style={mixins.textInput}
                                    defaultValue={this.state.rows[row.CURRENT_ROW_ID][field]}
                                    onChange={this.updateField(row.CURRENT_ROW_ID, field)}
                                />
                                {this.props.contentType.fields.indexOf(field) ===
                                this.props.contentType.fields.length - 1 ? (
                                    <div style={style.deleteRowIcon} onClick={this.deleteRow(row.CURRENT_ROW_ID)}>
                                        -
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                ))}

                <div style={mixins.buttonLine}>
                    <div style={style.addIcon} onClick={this.addRow}>
                        +
                    </div>
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

export default ListContentEditor
