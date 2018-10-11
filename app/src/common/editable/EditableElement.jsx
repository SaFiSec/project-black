import PropTypes from 'prop-types';
import React from 'react';


class EditableElement extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value,
            editable: false,
        };

        this.renderStaticElement = this.renderStaticElement.bind(this);
        this.renderEditableElement = this.renderEditableElement.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.editable === false && this.props.editable === true) {
            this.input.focus();
            return;
        }

        if (prevState.editable === false && this.state.editable === true) {
            this.input.focus();
        }
    }

    onChange(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
            return;
        }

        this.setState({ value });
    }

    onClick(event) {
        if (this.props.allowEditing === true) {
            event.preventDefault();
            this.setState({ editable: true });
        }
    }

    onKeyDown(event) {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(event);
            return;
        }

        const key = event.keyCode || event.which;

        if ([27].includes(key)) {
            this.setState({ editable: false });
        }
    }

    onBlur(value) {
        if (this.props.onBlur) {
            this.props.onBlur(value);
        }

        this.setState({ editable: false })
    }

    renderStaticElement() {
        const Element = this.props.element;

        return (
            <div
                onClick={this.onClick}
            >
                <Element
                    className={this.props.elementClassName}
                >
                    {this.state.value || this.props.placeholder}
                </Element>
            </div>
        );
    }

    renderEditableElement() {
        const InputElement = this.props.inputElement;

        return (
            <InputElement
                fluid
                ref={(input) => {
                    this.input = input;
                }}
                autoHeight
                rows={1}
                className={this.props.inputClassName}
                style={this.props.inputStyle}
                value={this.state.value}
                placeholder={this.props.placeholder}
                onChange={event => this.onChange(event.target.value)}
                onKeyDown={this.onKeyDown}
                onBlur={event => this.onBlur(event.target.value)}
            />
        );
    }

    render() {
        if (this.state.editable) {
            return this.renderEditableElement();
        }
        return this.renderStaticElement();
    }
}

EditableElement.propTypes = {
    allowEditing: PropTypes.bool,
    editable: PropTypes.bool,
    element: PropTypes.any,
    elementClassName: PropTypes.string,
    elementStyle: PropTypes.objectOf(PropTypes.any),
    inputClassName: PropTypes.string,
    inputElement: PropTypes.any,
    inputStyle: PropTypes.objectOf(PropTypes.any),
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string,
};

EditableElement.defaultProps = {
    allowEditing: true,
    editable: false,
    element: 'div',
    elementClassName: '',
    elementStyle: {},
    inputClassName: '',
    inputElement: 'input',
    inputStyle: {},
    onBlur: null,
    onChange: null,
    onKeyDown: null,
    placeholder: 'Click to edit',
    value: '',
};

export default EditableElement;