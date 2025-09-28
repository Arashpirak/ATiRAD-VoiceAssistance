"use client"

import { useRef, useState, useCallback, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Text, Html } from "@react-three/drei"
import * as THREE from "three"
import { ExplorationNode } from "./exploration-node"

interface NodeData {
  id: string
  position: [number, number, number]
  level: number
  parentId?: string
  isDiscovered: boolean
  type: "icon" | "portal" | "treasure"
}

export function InfiniteExplorer() {
  const { camera } = useThree()
  const [nodes, setNodes] = useState<NodeData[]>(() => generateInitialNodes())
  const [discoveredCount, setDiscoveredCount] = useState(0)
  const lastCameraPosition = useRef(new THREE.Vector3())
  const explorationRadius = useRef(15)

  // Generate initial nodes around the starting position
  function generateInitialNodes(): NodeData[] {
    const initialNodes: NodeData[] = []

    // Create a spiral of initial nodes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 5 + Math.random() * 3
      initialNodes.push({
        id: `initial-${i}`,
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius],
        level: 0,
        isDiscovered: true,
        type: Math.random() > 0.7 ? "portal" : "icon",
      })
    }

    return initialNodes
  }

  // Generate new nodes around a position
  const generateNodesAroundPosition = useCallback(
    (centerPos: [number, number, number], level: number, parentId: string) => {
      const newNodes: NodeData[] = []
      const nodeCount = 3 + Math.floor(Math.random() * 5) // 3-7 nodes

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 + Math.random() * 0.5
        const distance = 3 + Math.random() * 4
        const height = (Math.random() - 0.5) * 6

        newNodes.push({
          id: `${parentId}-child-${i}-${Date.now()}`,
          position: [
            centerPos[0] + Math.cos(angle) * distance,
            centerPos[1] + height,
            centerPos[2] + Math.sin(angle) * distance,
          ],
          level: level + 1,
          parentId,
          isDiscovered: false,
          type: Math.random() > 0.8 ? "treasure" : Math.random() > 0.6 ? "portal" : "icon",
        })
      }

      return newNodes
    },
    [],
  )

  // Check for nodes to discover based on camera proximity
  useFrame(() => {
    const cameraPos = camera.position
    const moved = lastCameraPosition.current.distanceTo(cameraPos) > 2

    if (moved) {
      lastCameraPosition.current.copy(cameraPos)

      setNodes((prevNodes) => {
        let newNodes = [...prevNodes]
        let hasNewDiscoveries = false

        // Discover nearby nodes
        newNodes = newNodes.map((node) => {
          if (!node.isDiscovered) {
            const nodePos = new THREE.Vector3(...node.position)
            const distance = cameraPos.distanceTo(nodePos)

            if (distance < explorationRadius.current) {
              hasNewDiscoveries = true
              return { ...node, isDiscovered: true }
            }
          }
          return node
        })

        // Generate new nodes at the exploration frontier
        const frontierNodes = newNodes.filter(
          (node) =>
            node.isDiscovered &&
            cameraPos.distanceTo(new THREE.Vector3(...node.position)) < explorationRadius.current * 0.7,
        )

        frontierNodes.forEach((frontierNode) => {
          const hasChildren = newNodes.some((n) => n.parentId === frontierNode.id)
          if (!hasChildren && Math.random() > 0.7) {
            const children = generateNodesAroundPosition(frontierNode.position, frontierNode.level, frontierNode.id)
            newNodes.push(...children)
          }
        })

        if (hasNewDiscoveries) {
          setDiscoveredCount((prev) => prev + 1)
        }

        return newNodes
      })
    }
  })

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      if (node.type === "portal") {
        // Generate a new cluster of nodes around this portal
        const newCluster = generateNodesAroundPosition(node.position, node.level, nodeId)
        setNodes((prev) => [...prev, ...newCluster])

        // Move camera towards the portal
        const targetPos = new THREE.Vector3(...node.position)
        targetPos.add(new THREE.Vector3(0, 0, 5))

        // Smooth camera transition (you could use react-spring for smoother animation)
        const currentPos = camera.position.clone()
        const direction = targetPos.sub(currentPos).multiplyScalar(0.3)
        camera.position.add(direction)
      }
    },
    [nodes, generateNodesAroundPosition, camera],
  )

  const discoveredNodes = useMemo(() => nodes.filter((node) => node.isDiscovered), [nodes])

  return (
    <>
      {/* Render all discovered nodes */}
      {discoveredNodes.map((node) => (
        <ExplorationNode
          key={node.id}
          position={node.position}
          type={node.type}
          level={node.level}
          onClick={() => handleNodeClick(node.id)}
        />
      ))}

      {/* Discovery counter */}
      <Html position={[0, 8, 0]}>
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-foreground">Discoveries: {discoveredCount}</div>
          <div className="text-sm text-muted-foreground">Level {Math.max(...discoveredNodes.map((n) => n.level))}</div>
        </div>
      </Html>

      {/* Exploration guide */}
      <Text position={[0, -8, 0]} fontSize={0.8} color="#888" anchorX="center" anchorY="middle">
        Move around to discover new nodes • Click portals to dive deeper
      </Text>
    </>
  )
}
