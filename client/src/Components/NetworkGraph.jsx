import React, { useEffect, useState } from 'react';
import { useNetworkGraphContext } from '../Context/NetworkGraphContext';
import { Graph } from 'react-d3-graph';

import '../Styles/networkGraph.css';

export default function NetworkGraph() {
	const {
		networkGraphNodes,
		networkGraphEdges,
		handleUpdateNetworkGraph,
		getDeviceName,
	} = useNetworkGraphContext();
	const [data, setData] = useState({
		nodes: networkGraphNodes,
		links: networkGraphEdges,
	});

	const myConfig = {
		automaticRearrangeAfterDropNode: true,
		collapsible: true,
		directed: false,
		focusAnimationDuration: 0.75,
		focusZoom: 1,
		freezeAllDragEvents: false,
		height: 600,
		highlightDegree: 2,
		highlightOpacity: 0.2,
		linkHighlightBehavior: true,
		maxZoom: 12,
		minZoom: 0.1,
		initialZoom: null,
		nodeHighlightBehavior: true,
		panAndZoom: false,
		staticGraph: false,
		staticGraphWithDragAndDrop: false,
		width: 800,
		d3: {
			alphaTarget: 0.05,
			gravity: -300,
			linkLength: 300,
			linkStrength: 2,
			disableLinkForce: false,
		},
		node: {
			color: '#1260cc',
			fontColor: 'white',
			fontSize: 10,
			fontWeight: 'normal',
			highlightColor: 'red',
			highlightFontSize: 14,
			highlightFontWeight: 'bold',
			highlightStrokeColor: 'red',
			highlightStrokeWidth: 1.5,
			mouseCursor: 'crosshair',
			renderLabel: false,
			size: {
				width: 1500,
				height: 400,
			},
			strokeColor: 'none',
			strokeWidth: 1.5,
			svg: '',
			symbolType: 'circle',
			labelProperty: 'name',
			viewGenerator: (node) => (
				<div
					style={{
						backgroundColor: '#1260cc',
						border: '1px solid black',
						width: '100%',
						height: '100%',
						fontSize: '9px',
						opacity: 1,
						color: 'white',
					}}
				>
					<p
						style={{
							width: '100%',
							height: '30%',
							whiteSpace: 'nowrap',
							margin: 0,
						}}
					>
						IP Address: {node.id}
					</p>
					{node.name.split('$$').map((el, index) => (
						<p
							key={index}
							title={el}
							style={{
								width: '100%',
								height: '30%',
								whiteSpace: 'nowrap',
								margin: 0,
							}}
						>
							{el}
						</p>
					))}
				</div>
			),
		},
		link: {
			color: 'lightgray',
			fontColor: 'black',
			fontSize: 8,
			fontWeight: 'normal',
			highlightColor: 'red',
			highlightFontSize: 8,
			highlightFontWeight: 'normal',
			labelProperty: 'label',
			mouseCursor: 'pointer',
			opacity: 1,
			renderLabel: false,
			semanticStrokeWidth: true,
			strokeWidth: 3,
			markerHeight: 6,
			markerWidth: 6,
			type: 'STRAIGHT',
			selfLinkDirection: 'TOP_RIGHT',
			strokeDasharray: 0,
			strokeDashoffset: 0,
			strokeLinecap: 'butt',
		},
	};

	const onClickNode = function (nodeId) {
		window.alert(`Fetching device name for: ${nodeId}`);
		getDeviceName({ id: nodeId });
	};

	const onClickLink = function (source, target) {
		window.alert(`Clicked link between ${source} and ${target}`);
	};

	useEffect(() => {
		console.log("Network Graph Nodes:", networkGraphNodes);
		console.log("Network Graph Edges:", networkGraphEdges);
		setData({
			nodes: networkGraphNodes,
			links: networkGraphEdges,
		});
	}, [networkGraphNodes, networkGraphEdges]);

	return (
		<div style={{ width: '100%', flex: 1 }}>
			<div style={{ height: '650px', width: '100%' }}>
				<button type='button' onClick={handleUpdateNetworkGraph}>
					Update Network Graph
				</button>
				<Graph
					id='graph-id' // id is mandatory, if no id is defined rd3g will throw an error
					data={data}
					config={myConfig}
					onClickNode={onClickNode}
					onClickLink={onClickLink}
					style={{ width: '100%', height: '100%' }}
				/>
			</div>
		</div>
	);
}
