import java.util.*;
import java.util.stream.Collectors;

public class SteinerTreeKruskal {
    static class Node {
        private String content;
        private Map<Node, Edge> neighbors;

        public Node(String content) {
            this.content = content;
            this.neighbors = new HashMap<>();
        }

        public String getContent() {
            return content;
        }

        public Map<Node, Edge> getNeighborEdges() {
            return neighbors;
        }

        public Set<Node> getNeighbors() {
            return neighbors.keySet();
        }

        public Edge getEdgeTo(Node other) {
            return neighbors.get(other);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Node node = (Node) o;
            return Objects.equals(content, node.content);
        }

        @Override
        public int hashCode() {
            return Objects.hash(content);
        }
    }

    static class Edge {
        private String name;
        private Node node1;
        private Node node2;

        public Edge(String name, Node node1, Node node2) {
            this.name = name;
            this.node1 = node1;
            this.node2 = node2;
        }

        public String getName() {
            return name;
        }

        public Node getOtherNode(Node node) {
            return node.equals(node1) ? node2 : node1;
        }

        public Node getStart() {
            return node1;
        }

        public Node getEnd() {
            return node2;
        }
    }

    static class Graph {
        private List<Node> nodes;
        private Map<String, Node> nodeMap;

        public Graph() {
            this.nodes = new ArrayList<>();
            this.nodeMap = new HashMap<>();
        }

        public void addEdge(String from, String to, String edgeName) {
            Node fromNode = nodeMap.computeIfAbsent(from, k -> {
                Node n = new Node(k);
                nodes.add(n);
                return n;
            });
            Node toNode = nodeMap.computeIfAbsent(to, k -> {
                Node n = new Node(k);
                nodes.add(n);
                return n;
            });

            Edge edge = new Edge(edgeName, fromNode, toNode);
            fromNode.getNeighborEdges().put(toNode, edge);
            toNode.getNeighborEdges().put(fromNode, edge);
        }

        private static class PathInfo {
            List<Node> path;
            int distance;

            PathInfo(List<Node> path, int distance) {
                this.path = path;
                this.distance = distance;
            }
        }

        private static class UnionFind {
            private Map<Node, Node> parent;
            private Map<Node, Integer> rank;

            UnionFind(Set<Node> nodes) {
                parent = new HashMap<>();
                rank = new HashMap<>();
                for (Node node : nodes) {
                    parent.put(node, node);
                    rank.put(node, 0);
                }
            }

            Node find(Node node) {
                if (!parent.get(node).equals(node)) {
                    parent.put(node, find(parent.get(node)));
                }
                return parent.get(node);
            }

            void union(Node x, Node y) {
                Node rootX = find(x);
                Node rootY = find(y);

                if (!rootX.equals(rootY)) {
                    if (rank.get(rootX) < rank.get(rootY)) {
                        Node temp = rootX;
                        rootX = rootY;
                        rootY = temp;
                    }
                    parent.put(rootY, rootX);
                    if (rank.get(rootX).equals(rank.get(rootY))) {
                        rank.put(rootX, rank.get(rootX) + 1);
                    }
                }
            }
        }

        private boolean isConnected(Set<Node> nodes) {
            if (nodes.isEmpty()) return true;
            
            // Start BFS from any node
            Node start = nodes.iterator().next();
            Set<Node> visited = new HashSet<>();
            Queue<Node> queue = new LinkedList<>();
            
            queue.offer(start);
            visited.add(start);
            
            while (!queue.isEmpty()) {
                Node current = queue.poll();
                for (Node neighbor : current.getNeighbors()) {
                    if (nodes.contains(neighbor) && !visited.contains(neighbor)) {
                        visited.add(neighbor);
                        queue.offer(neighbor);
                    }
                }
            }
            
            // All nodes should be visited if graph is connected
            return visited.size() == nodes.size();
        }

        private boolean areTerminalsConnected(Set<Node> nodes, Set<Node> terminals) {
            if (terminals.isEmpty()) return true;
            
            // Start from first terminal
            Node start = terminals.iterator().next();
            if (!nodes.contains(start)) return false;
            
            // BFS to find all reachable terminals
            Set<Node> visited = new HashSet<>();
            Queue<Node> queue = new LinkedList<>();
            queue.offer(start);
            visited.add(start);
            int terminalsFound = 1;
            
            while (!queue.isEmpty()) {
                Node current = queue.poll();
                
                for (Node neighbor : current.getNeighbors()) {
                    if (nodes.contains(neighbor) && !visited.contains(neighbor)) {
                        visited.add(neighbor);
                        queue.offer(neighbor);
                        if (terminals.contains(neighbor)) {
                            terminalsFound++;
                        }
                    }
                }
            }
            
            return terminalsFound == terminals.size();
        }

        private Set<Node> pruneNonTerminals(Set<Node> nodes, Set<Node> terminals) {
            Set<Node> result = new HashSet<>(nodes);
            
            while (true) {
                Set<Node> removableNodes = new HashSet<>();
                
                // Collect all non-terminal nodes that could potentially be removed
                for (Node node : new ArrayList<>(result)) {
                    if (!terminals.contains(node)) {
                        int connectionsInTree = 0;
                        for (Node neighbor : node.getNeighbors()) {
                            if (result.contains(neighbor)) {
                                connectionsInTree++;
                            }
                        }
                        if (connectionsInTree <= 2) {
                            removableNodes.add(node);
                        }
                    }
                }
                
                if (removableNodes.isEmpty()) {
                    break;
                }
                
                boolean anyRemoved = false;
                // Try to remove each candidate node
                for (Node node : removableNodes) {
                    result.remove(node);
                    if (!areTerminalsConnected(result, terminals) || !isConnected(result)) {
                        result.add(node);  // Put it back if it disconnects the tree
                    } else {
                        anyRemoved = true;
                    }
                }
                
                if (!anyRemoved) {
                    break;
                }
            }
            
            // Final verification
            if (!isConnected(result)) {
                throw new RuntimeException("Final Steiner tree is not connected!");
            }
            
            return result;
        }

        public Set<Node> findSteinerTree(Set<String> terminals) {
            if (nodes.isEmpty() || terminals.isEmpty()) {
                return Collections.emptySet();
            }

            // Convert terminal strings to nodes
            Set<Node> terminalNodes = new HashSet<>();
            for (String terminal : terminals) {
                Node node = nodeMap.get(terminal);
                if (node != null) {
                    terminalNodes.add(node);
                }
            }

            if (terminalNodes.size() <= 1) {
                return terminalNodes;
            }

            // Find shortest paths between all terminal pairs
            Map<Node, Map<Node, PathInfo>> shortestPaths = new HashMap<>();
            for (Node source : terminalNodes) {
                shortestPaths.put(source, findShortestPaths(source));
            }

            // Create complete graph of terminals with shortest paths as edges
            List<PathInfo> allPaths = new ArrayList<>();
            for (Node source : terminalNodes) {
                for (Node target : terminalNodes) {
                    if (source.getContent().compareTo(target.getContent()) < 0) {
                        PathInfo pathInfo = shortestPaths.get(source).get(target);
                        if (pathInfo != null) {
                            allPaths.add(pathInfo);
                        }
                    }
                }
            }

            // Sort paths by distance
            allPaths.sort(Comparator.comparingInt(p -> p.distance));

            // Build MST using Kruskal's algorithm
            Set<Node> steinerNodes = new HashSet<>();
            UnionFind uf = new UnionFind(terminalNodes);

            for (PathInfo pathInfo : allPaths) {
                Node start = pathInfo.path.get(0);
                Node end = pathInfo.path.get(pathInfo.path.size() - 1);
                
                if (!uf.find(start).equals(uf.find(end))) {
                    steinerNodes.addAll(pathInfo.path);
                    uf.union(start, end);
                }
            }

            // Verify initial tree is connected
            if (!isConnected(steinerNodes)) {
                throw new RuntimeException("Initial Steiner tree is not connected!");
            }

            // Prune unnecessary nodes while maintaining connectivity
            Set<Node> prunedTree = pruneNonTerminals(steinerNodes, terminalNodes);

            // Final verification
            if (!isConnected(prunedTree)) {
                throw new RuntimeException("Final Steiner tree is not connected!");
            }

            return prunedTree;
        }

        public Set<Edge> getSteinerTreeEdges(Set<String> terminals) {
            Set<Node> steinerNodes = findSteinerTree(terminals);
            Set<Edge> edges = new HashSet<>();
            Set<String> processedEdges = new HashSet<>();  // To avoid duplicates
            
            // Collect all edges in the Steiner tree
            for (Node node : steinerNodes) {
                for (Node neighbor : node.getNeighbors()) {
                    if (steinerNodes.contains(neighbor)) {
                        Edge edge = node.getEdgeTo(neighbor);
                        if (!processedEdges.contains(edge.getName())) {
                            edges.add(edge);
                            processedEdges.add(edge.getName());
                        }
                    }
                }
            }
            
            // Verify that all terminals are connected by these edges
            Set<Node> terminalNodes = terminals.stream()
                .map(nodeMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
            
            if (!areTerminalsConnectedByEdges(edges, terminalNodes)) {
                throw new RuntimeException("Not all terminals are connected by the Steiner tree edges!");
            }
            
            return edges;
        }

        private boolean areTerminalsConnectedByEdges(Set<Edge> edges, Set<Node> terminals) {
            if (terminals.isEmpty()) return true;
            
            // Start from first terminal
            Node start = terminals.iterator().next();
            Set<Node> visited = new HashSet<>();
            Queue<Node> queue = new LinkedList<>();
            
            queue.offer(start);
            visited.add(start);
            int terminalsFound = 1;
            
            while (!queue.isEmpty()) {
                Node current = queue.poll();
                
                // Check all edges connected to current node
                for (Edge edge : edges) {
                    Node otherEnd = null;
                    if (edge.getStart() == current) {
                        otherEnd = edge.getEnd();
                    } else if (edge.getEnd() == current) {
                        otherEnd = edge.getStart();
                    }
                    
                    if (otherEnd != null && !visited.contains(otherEnd)) {
                        visited.add(otherEnd);
                        queue.offer(otherEnd);
                        if (terminals.contains(otherEnd)) {
                            terminalsFound++;
                        }
                    }
                }
            }
            
            return terminalsFound == terminals.size();
        }

        private Map<Node, PathInfo> findShortestPaths(Node start) {
            Map<Node, PathInfo> paths = new HashMap<>();
            Map<Node, Integer> distances = new HashMap<>();
            Map<Node, Node> previous = new HashMap<>();
            PriorityQueue<Node> queue = new PriorityQueue<>(
                Comparator.comparingInt(n -> distances.getOrDefault(n, Integer.MAX_VALUE))
            );

            for (Node node : nodes) {
                distances.put(node, Integer.MAX_VALUE);
            }
            distances.put(start, 0);
            queue.offer(start);

            while (!queue.isEmpty()) {
                Node current = queue.poll();
                int currentDist = distances.get(current);

                for (Node neighbor : current.getNeighbors()) {
                    int newDist = currentDist + 1;
                    if (newDist < distances.get(neighbor)) {
                        distances.put(neighbor, newDist);
                        previous.put(neighbor, current);
                        queue.remove(neighbor);
                        queue.offer(neighbor);
                    }
                }
            }

            // Reconstruct paths
            for (Node end : nodes) {
                if (distances.get(end) < Integer.MAX_VALUE) {
                    List<Node> path = new ArrayList<>();
                    Node current = end;
                    while (current != null) {
                        path.add(0, current);
                        current = previous.get(current);
                    }
                    paths.put(end, new PathInfo(path, distances.get(end)));
                }
            }

            return paths;
        }
    }

    public static void main(String[] args) {
        // Run small test case for manual verification
        runSmallTest();
        
        System.out.println("\n" + "=".repeat(80) + "\n");
        
        // Run large test case for performance testing
        runLargeTest();
    }
    
    private static void runSmallTest() {
        System.out.println("Running small test case (5x5 grid)...");
        int gridSize = 5;  // 5x5 grid = 25 nodes
        
        // Create graph
        Graph g = createGridGraph(gridSize);

        // Define terminals at corners and center
        Set<String> terminals = new HashSet<>(Arrays.asList(
            "N0_0",  // top-left corner
            "N0_4",  // top-right corner
            "N4_0",  // bottom-left corner
            "N4_4",  // bottom-right corner
            "N2_2"   // center
        ));

        // Print initial grid
        printGrid(gridSize, terminals);
        System.out.println("\nTerminal nodes: " + terminals);

        // Find and verify Steiner tree
        Set<Node> result = runSteinerTest(g, terminals);
        
        // Print result grid
        System.out.println("\nSteiner Tree (O=terminal, S=steiner point, .=unused):");
        printSteinerTree(gridSize, terminals, result);
    }
    
    private static void runLargeTest() {
        System.out.println("Running large test case (25x25 grid)...");
        int gridSize = 25;  // 25x25 grid = 625 nodes
        int numTerminals = 20;
        
        // Create graph
        long graphStartTime = System.nanoTime();
        Graph g = createGridGraph(gridSize);
        long graphEndTime = System.nanoTime();
        double graphCreationTime = (graphEndTime - graphStartTime) / 1_000_000.0;
        
        // Print graph statistics
        System.out.println("\nGraph Statistics:");
        System.out.println("- Nodes: " + gridSize * gridSize + " (" + gridSize + "x" + gridSize + " grid)");
        System.out.println("- Edges: " + (2 * gridSize * (gridSize - 1)));
        System.out.println("- Graph creation time: " + String.format("%.2f", graphCreationTime) + " ms");

        // Generate random terminals
        Set<String> terminals = generateRandomTerminals(gridSize, numTerminals);
        System.out.println("\nTerminal nodes: " + terminals);

        // Find and verify Steiner tree
        runSteinerTest(g, terminals);
    }
    
    private static Graph createGridGraph(int gridSize) {
        Graph g = new Graph();
        for (int i = 0; i < gridSize; i++) {
            for (int j = 0; j < gridSize; j++) {
                String current = "N" + i + "_" + j;
                if (j < gridSize - 1) {
                    g.addEdge(current, "N" + i + "_" + (j + 1), "E_" + i + "_" + j + "_H");
                }
                if (i < gridSize - 1) {
                    g.addEdge(current, "N" + (i + 1) + "_" + j, "E_" + i + "_" + j + "_V");
                }
            }
        }
        return g;
    }
    
    private static Set<String> generateRandomTerminals(int gridSize, int numTerminals) {
        Set<String> terminals = new HashSet<>();
        Random rand = new Random(42);  // Fixed seed for reproducibility
        while (terminals.size() < numTerminals) {
            int i = rand.nextInt(gridSize);
            int j = rand.nextInt(gridSize);
            terminals.add("N" + i + "_" + j);
        }
        return terminals;
    }
    
    private static Set<Node> runSteinerTest(Graph g, Set<String> terminals) {
        System.out.println("\nFinding Steiner tree...");
        long startTime = System.nanoTime();
        Set<Node> result = g.findSteinerTree(terminals);
        Set<Edge> edges = g.getSteinerTreeEdges(terminals);
        long endTime = System.nanoTime();
        double executionTime = (endTime - startTime) / 1_000_000.0;

        // Print statistics
        System.out.println("\nResults:");
        System.out.println("- Vertices in Steiner tree: " + result.size());
        System.out.println("- Edges in Steiner tree: " + edges.size());
        System.out.println("- Edge list:");
        edges.stream()
            .map(Edge::getName)
            .sorted()
            .forEach(name -> System.out.println("  * " + name));
        System.out.println("- Execution time: " + String.format("%.2f", executionTime) + " ms");
        
        // Verify solution
        System.out.println("\nVerification:");
        System.out.println("- All terminals included: " + 
            terminals.stream().allMatch(t -> 
                result.stream().anyMatch(n -> n.getContent().equals(t))));
        System.out.println("- Tree is connected: " + g.isConnected(result));
        
        // Verify edge connectivity
        Set<Node> terminalNodes = terminals.stream()
            .map(t -> result.stream()
                .filter(n -> n.getContent().equals(t))
                .findFirst()
                .orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        System.out.println("- All terminals connected by edges: " + 
            g.areTerminalsConnectedByEdges(edges, terminalNodes));
        
        return result;
    }
    
    private static void printGrid(int gridSize, Set<String> terminals) {
        System.out.println("\nGrid Structure (O=terminal, +=non-terminal):");
        for (int i = 0; i < gridSize; i++) {
            StringBuilder line = new StringBuilder();
            for (int j = 0; j < gridSize; j++) {
                String node = "N" + i + "_" + j;
                line.append(terminals.contains(node) ? "O" : "+");
                if (j < gridSize - 1) line.append("---");
            }
            System.out.println(line.toString());
            if (i < gridSize - 1) {
                StringBuilder connectLine = new StringBuilder();
                for (int j = 0; j < gridSize; j++) {
                    connectLine.append("|   ");
                }
                System.out.println(connectLine.toString());
            }
        }
    }
    
    private static void printSteinerTree(int gridSize, Set<String> terminals, Set<Node> result) {
        for (int i = 0; i < gridSize; i++) {
            StringBuilder line = new StringBuilder();
            for (int j = 0; j < gridSize; j++) {
                String node = "N" + i + "_" + j;
                String symbol = ".";
                if (terminals.contains(node)) {
                    symbol = "O";
                } else if (result.stream().anyMatch(n -> n.getContent().equals(node))) {
                    symbol = "S";
                }
                line.append(symbol);
                
                // Add horizontal edge if it exists in the solution
                if (j < gridSize - 1) {
                    String nextNode = "N" + i + "_" + (j + 1);
                    boolean hasEdge = result.stream().anyMatch(n -> n.getContent().equals(node)) &&
                                    result.stream().anyMatch(n -> n.getContent().equals(nextNode));
                    line.append(hasEdge ? "---" : "   ");
                }
            }
            System.out.println(line.toString());
            
            // Add vertical edges
            if (i < gridSize - 1) {
                StringBuilder connectLine = new StringBuilder();
                for (int j = 0; j < gridSize; j++) {
                    String currentNode = "N" + i + "_" + j;
                    String belowNode = "N" + (i + 1) + "_" + j;
                    boolean hasEdge = result.stream().anyMatch(n -> n.getContent().equals(currentNode)) &&
                                    result.stream().anyMatch(n -> n.getContent().equals(belowNode));
                    connectLine.append(hasEdge ? "|" : " ");
                    connectLine.append("   ");
                }
                System.out.println(connectLine.toString());
            }
        }
    }
    
    private static int countEdges(Set<Node> result) {
        Set<String> countedEdges = new HashSet<>();
        int edgeCount = 0;
        
        for (Node node : result) {
            for (Node neighbor : node.getNeighbors()) {
                if (result.contains(neighbor)) {
                    Edge edge = node.getEdgeTo(neighbor);
                    if (!countedEdges.contains(edge.getName())) {
                        countedEdges.add(edge.getName());
                        edgeCount++;
                    }
                }
            }
        }
        
        return edgeCount;
    }
}
