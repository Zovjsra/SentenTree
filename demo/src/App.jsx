import * as DataService from './DataService.js';
import * as d3 from 'd3-selection';

import React, { PropTypes } from 'react';
import { SentenTreeModel, SentenTreeVis as _SentenTreeVis } from '../../src/main.js';

import { DATASETS } from './datasets.js';
import { createComponent } from 'react-d3kit';
import { format } from 'd3-format';

const SentenTreeVis = createComponent(_SentenTreeVis);

const propTypes = {
  className: PropTypes.string,
};
const defaultProps = {};

const formatNumber = format(',d');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: 0,
      selectedNode: null,
      renderedGraphs: [],
    };
  }

  componentDidMount() {
    this.loadFile(DATASETS[this.state.dataset].file);
  }

  changeDataset(value) {
    this.setState({
      dataset: value,
      selectedNode: null,
      renderedGraphs: [],
    });
    this.loadFile(DATASETS[value].file);
  }

  selectNode(node) {
    const [x, y] = d3.mouse(this.c);
    this.setState({
      selectedNode: node,
      nodeY: y,
      nodeX: x,
    });
  }

  clearNode() {
    this.setState({ selectedNode: null });
  }

  loadFile(file) {
    DataService.loadFile(`data/${file}`, (error, data) => {
      console.time('Build model');
      const model = new SentenTreeModel(data);
      console.timeEnd('Build model');
      console.time('Build rendered graphs');
      const renderedGraphs = model.getRenderedGraphs(3);
      console.timeEnd('Build rendered graphs');

      this.setState({
        model,
        renderedGraphs,
      });
    });
  }

  renderSelectedNode() {
    const { selectedNode: node, nodeX, nodeY } = this.state;
    if (node) {
      return (
        <div
          className="popover-content"
          style={{
            top: `${nodeY + 10}px`,
            left: `${nodeX}px`,
          }}
        >
          <div className="popover-inner">
            <div className="content-center">
              <h4>
                {node.data.entity}
                &nbsp;
                <small>({formatNumber(node.data.freq)})</small>
              </h4>
            </div>
            {node.data.topEntries.slice(0, 1).map(entry =>
              <div key={entry.id} className="mock-tweet">
                <div className="top-remark">
                  <i className="glyphicon glyphicon-star"></i> Top entry
                </div>
                {entry.rawText}
                <div className="word-count">
                  {formatNumber(entry.count)} occurrences
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const classes = ['App'];
    if (this.props.className) {
      classes.push(this.props.className);
    }

    const { renderedGraphs } = this.state;

    return (
      <div className={classes.join(' ')}>
        <div
          className="popover-container"
          ref={c => { this.c = c; }}
        >
          {this.renderSelectedNode()}
        </div>
        <div className="container content">
          <div className="page-header">
            <div className="pull-right">
              <ul className="nav nav-pills floater-links">
                <li role="presentation">
                  <a target="_blank" href="http://www.cc.gatech.edu/~stasko/papers/infovis16-sententree.pdf">Publication</a>
                </li>
                <li role="presentation">
                  <a target="_blank" href="https://github.com/twitter/sententree">Source Code</a>
                </li>
              </ul>
              <div className="star-block">
                <iframe
                  src="https://ghbtns.com/github-btn.html?user=twitter&repo=SentenTree&type=star&count=true"
                  frameBorder="0"
                  scrolling="0"
                  width="100px"
                  height="20px"
                />
              </div>
            </div>
            <h1>SentenTree</h1>
          </div>
          <p className="lead">
            SentenTree is a novel text visualization technique for summarizing
            a collection of social media text, i.e. take thousands or more Tweets
            and summarize what the Tweets are about.
          </p>
        </div>
        <div className="container">
          <p>
            Choose from these example datasets and see the visualization below.
          </p>
          <select
            className="form-control"
            value={this.state.dataset}
            onChange={e => this.changeDataset(e.target.value)}
          >
            {DATASETS.map((dataset, i) =>
              <option key={dataset.file} value={i}>
                {dataset.name || dataset.file}
              </option>
            )}
          </select>
        </div>
        <div className="container">
          <div className="vis-container">
            <SentenTreeVis
              data={renderedGraphs}
              onNodeClick={node => { console.log(node); }}
              onNodeMouseenter={node => { this.selectNode(node); }}
              onNodeMousemove={node => { this.selectNode(node); }}
              onNodeMouseleave={() => { this.clearNode(); }}
            />
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
