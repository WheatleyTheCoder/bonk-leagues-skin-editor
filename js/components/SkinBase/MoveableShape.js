import React from 'react';
import { connect } from 'react-redux';
import keydown from 'react-keydown';

class MoveableShape extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rect: null,
            ...this.props.shape
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            ...newProps
        });
    }

    render() {
        var scaleFactor = 700/30;

        var selected = this.props.shape.selected;
        var topLayer = selected && this.props.topLayer;

        return (
            <div className={"shape" + (selected?" selected":"") + (topLayer?" top":"")}
                onMouseDown={e => {
                    e.stopPropagation();
                    !this.props.shape.selected && this.props.onClick();
                }}
                style={{
                    transform: `
                        translate(`+this.state.position.x+`px,`+this.state.position.y+`px)
                        translate(-50%,-50%)
                        scale(`+this.state.scale+`)
                        rotate(`+this.state.rotation+`deg)
                        translateX(`+(this.state.hf?-1:1)*(this.state.rect?(this.state.rect.width/2 - this.props.origin.x):'0')+`px)
                        translateY(`+(this.state.vf?-1:1)*(this.state.rect?(this.state.rect.height/2 - this.props.origin.y):'0')+`px)
                    `
                }}
                ref={shape=>{
                    if (shape && !this.state.rect) {
                        this.setState({
                            rect: shape.getBoundingClientRect()
                        });
                    }
                }}
            >
                <span className={(this.state.hf?'hf':'')+' '+(this.state.vf?'vf':'')} onMouseDown={e=>this.props.onShapeDown(e,this)} dangerouslySetInnerHTML={{__html: this.props.shapeHTML}}></span>
                {
                    this.props.shape.selected &&
                    <div className="dragger" onMouseDown={()=>this.props.onDraggerDown(this)}></div>
                }
            </div>
        );
    }
}

var mapStateToProps = (state, props) => {
    var shapeHTML = state.allShapes[props.shape.shapeID].replace(/fill\=\".+?\"/g, 'fill="#'+(props.shape.color || '000')+'"');
    var confusingOffsetRegex = shapeHTML.match(/matrix\((1\.0|1),\s*(0\.0|0),\s*(0\.0|0),\s*(1\.0|1),\s*(.+),\s*(.+)\)/);

    return {
        shapeHTML,
        ...props.shape,
        origin: {
            x: parseFloat(confusingOffsetRegex[5])+2,
            y: parseFloat(confusingOffsetRegex[6])+2
        },
        topLayer: state.topLayer
    };
}
var mapDispatchToProps = (dispatch, props) => {
    return {
        onClick: e => {
            dispatch({
                type: 'SELECT_SHAPE',
                id: props.shape.uuid
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MoveableShape);
