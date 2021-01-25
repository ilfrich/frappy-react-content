import React from "react"
import { mixins } from "quick-n-dirty-react"

class ContentMetaForm extends React.Component {
    constructor(props) {
        super(props)
        this.references = {}

        this.getReferences = this.getReferences.bind(this)
        this.getLabel = this.getLabel.bind(this)
    }

    getReferences() {
        const result = []
        Object.keys(this.references).forEach(ref => {
            if (this.references[ref].checked && result.indexOf(ref) === -1) {
                // avoid duplicates
                result.push(ref)
            }
        })
        return result
    }

    getLabel() {
        return this.label.value.trim()
    }

    render() {
        return (
            <div>
                <div>
                    <label style={mixins.label} htmlFor="label">
                        Label
                    </label>
                    <input
                        type="text"
                        style={mixins.textInput}
                        defaultValue={this.props.content.label}
                        id="label"
                        ref={el => {
                            this.label = el
                        }}
                    />
                </div>
                <div>
                    <label style={mixins.label}>References</label>
                    <ul style={mixins.noList}>
                        {this.props.references.map(reference => (
                            <li key={reference}>
                                <input
                                    type="checkbox"
                                    defaultChecked={this.props.content.references.indexOf(reference) !== -1}
                                    ref={el => {
                                        this.references[reference] = el
                                    }}
                                    id={`ref-${reference}`}
                                />
                                <label htmlFor={`ref-${reference}`} style={mixins.label}>
                                    {reference}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }
}

export default ContentMetaForm
