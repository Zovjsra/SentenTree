import { SentenTreeModel, SentenTreeVis } from '../../src/main.js';
import { text as d3Text } from 'd3-request';
import { tsvParseRows } from 'd3-dsv';

d3Text('data/goal1.tsv', (error, data) => {
  const rows = tsvParseRows(data)
    .map(([id, text, count]) => ({id, text, cnt: +count}));
  console.log('data', rows);

  const model = new SentenTreeModel(rows);
  console.log('model', model);

  const graph = model.graphs[0].toRenderedGraph();
  console.log('graph', graph);

  const chart = new SentenTreeVis('#vis')
    .data(graph);
});