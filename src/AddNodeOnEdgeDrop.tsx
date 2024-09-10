import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 250, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Node 2' } },
];

let nodeId = 1;
const getId = () => `${nodeId++}`;

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

// Node types with different styles
const nodeTypes:any = {
  node: {
    label: 'Node',
    style: { border: '1px solid black' },
  },
  nodeDotted: {
    label: 'Node (Dotted Border)',
    style: { border: '2px dotted black' },
  },
  nodeEllipse: {
    label: 'Node (Ellipse)',
    style: { borderRadius: '30%', width: 100, height: 100 },
  },
};


const AddNodeOnEdgeDrop = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<any>(null); // Reference to the ReactFlow wrapper
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
  const onInit = (rfi: ReactFlowInstance) => setReactFlowInstance(rfi);
  
  const connectingNodeId = useRef(null);
  const [menuPosition, setMenuPosition] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  

  const handleEdgeDrop = (event: any, edge: any) => {
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setSelectedEdge(edge);
  };

  // Add node based on the selected type from the menu
  const handleAddNodeOnEdge = (nodeType:any) => {
    console.log('selectedEdge = ', selectedEdge);
    if (selectedEdge) {
      const newNodeId = `${nodes.length + 1}`;
      const newNode = {
        id: newNodeId,
        position: { x: menuPosition.x, y: menuPosition.y }, // Position the new node in the center
        data: { label: nodeTypes[nodeType].label }, // Label based on node type
        style: nodeTypes[nodeType].style, // Apply styles based on node type
      };

      // Create two new edges to replace the original one
      const newEdgeSource = {
        id: `e-${selectedEdge.source}-${newNodeId}`,
        source: selectedEdge.source,
        target: newNodeId,
      };

      // Update nodes and edges
      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => eds.concat([newEdgeSource]));

      // Hide the menu
      setMenuPosition(null);
    }
  };

  useEffect(() => {
    if (reactFlowInstance && nodes.length) {
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance]);
  

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event: any) => {
      if (!connectingNodeId.current) return;
      setMenuPosition({ x: event.clientX, y: event.clientY });
      
      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        console.log('reactFlowInstance = ', reactFlowInstance);
        if (reactFlowInstance) {
          const newNode = {
            id,
            position: reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            }),
            data: { label: `Node ${id}` },
            origin: [0.5, 0.0],
          };
          let edge:any = { id, source: connectingNodeId.current, target: id }
          // setSelectedEdge(edge)
          // setNodes((nds) => nds.concat(newNode));
          // setEdges((eds:any) =>
          //   eds.concat(edge),
          // );
          handleEdgeDrop(event, edge)
        }
      }
    },
    [reactFlowInstance?.screenToFlowPosition],
  );

  return (
    <>
      <ReactFlowProvider>
        <div style={{ height: 500 }} ref={reactFlowWrapper}>
          <ReactFlow
            onInit={onInit}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            // onConnect={handleConnect} // Listen for edge connection
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>

          {/* Context menu for selecting node type */}
          {menuPosition && (
            <div
              style={{
                position: 'absolute',
                top: menuPosition.y,
                left: menuPosition.x,
                background: 'white',
                border: '1px solid black',
                padding: '10px',
                transform: 'translate(-50%, -50%)', // Adjust the menu to be fully centered
              }}
            >
              <p>Select Node Type</p>
              <button onClick={() => handleAddNodeOnEdge('node')}>Node</button>
              <button onClick={() => handleAddNodeOnEdge('nodeDotted')}>
                Node (Dotted Border)
              </button>
              <button onClick={() => handleAddNodeOnEdge('nodeEllipse')}>
                Node (Ellipse)
              </button>
              <button onClick={() => setMenuPosition(null)}>Cancel</button>
            </div>
          )}
        </div>
      </ReactFlowProvider>
    </>
  );
}

export default AddNodeOnEdgeDrop;
