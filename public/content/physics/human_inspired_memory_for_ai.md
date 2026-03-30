---
title: "Synthetic Neural Persistence: Translating Human Memory Architectures into Rust-Based Cognitive Systems"
slug: "human_inspired_memory_for_ai"
category: "physics"
date: "2026-03-30"
author: "Rendi Virgantara Setiawan"
readTime: "~15 MINUTES"
excerpt: "Exploring how cognitive neuroscience and architectures like ACT-R can inform the design of synthetic memory systems for autonomous AI agents, with Rust implementations."
tags: ["AI", "memory", "cognitive systems", "rust", "agents", "ACT-R", "neuroscience"]
---

# **Synthetic Neural Persistence: Translating Human Memory Architectures into Rust-Based Cognitive Systems for Autonomous Agents**

The evolution of artificial intelligence from reactive, stateless models to autonomous agents necessitates a sophisticated understanding of memory as a dynamic cognitive infrastructure. While Large Language Models (LLMs) provide the semantic reasoning engine, they often lack the persistent state required for long-term consistency, complex task decomposition, and historical contextualization.1 By drawing on cognitive neuroscience and established cognitive architectures like ACT-R and Soar, developers can architect synthetic memory systems that emulate the human ability to encode, consolidate, and retrieve information across varying temporal scales.3 The implementation of such systems in Rust offers the deterministic memory safety and high-performance concurrency required to manage these complex data structures without the overhead and unpredictability of garbage-collected environments.4

## **The Neurobiological Blueprint for Synthetic Memory**

Human memory is not a singular repository but a distributed network of specialized systems, each optimized for specific functional and temporal constraints. These biological systems provide the primary taxonomy for designing AI memory layers.2

### **Sensory and Working Memory: The Gateway to Cognition**

Sensory memory acts as the most ephemeral stage of processing, capturing raw stimuli from the environment for fractions of a second.6 In humans, this involves iconic (visual), echoic (auditory), haptic (touch), olfactory (smell), and gustatory (taste) buffers.6 While most sensory data is immediately discarded, selective attention filters salient information into working memory.8 In artificial systems, this corresponds to the initial perceptual buffers and tokenization layers where multi-modal inputs are transformed into high-dimensional vector representations.10

Working memory serves as the cognitive "notepad," holding information for a brief period while it is being actively manipulated for a specific task.6 It is fundamentally linked to intelligence and problem-solving.6 In human psychology, working memory is often associated with the prefrontal cortex and is estimated to hold roughly ![][image1] units of information, though modern theories emphasize the dynamic allocation of attention rather than fixed slots.13 In the context of AI agents, the context window of the underlying model functions as the primary working memory.1

| Human Memory System | Duration | Biological Substrate | AI Implementation Analog |
| :---- | :---- | :---- | :---- |
| **Sensory** | \< 1 second | Thalamus / Primary Sensory Cortex | Input Tokenization / Initial Embeddings.6 |
| **Working** | Seconds to Minutes | Prefrontal Cortex | Model Context Window / KV-Cache.1 |
| **Short-Term** | Minutes to Hours | Hippocampus (initial encoding) | Recent Conversation History / Semantic Cache.2 |
| **Long-Term** | Days to Decades | Neocortex (distributed) | Vector DB / Knowledge Graphs / Skill Libraries.1 |

### **Declarative Memory: Episodic and Semantic Systems**

Long-term memory is broadly categorized into explicit (declarative) and implicit (non-declarative) systems.13 Declarative memory involves the conscious recall of facts and events.17

Episodic memory is the record of specific firsthand experiences, typically tied to a specific time, place, and emotional context.6 It is unique to the individual’s perspective and serves as a "brain's scrapbook".6 For an AI agent, episodic memory stores specific past interactions, allowing it to remember user preferences expressed in previous sessions or historical failures that should be avoided.1

Semantic memory is the store of generalized knowledge about the world—facts, meanings, and concepts detached from the specific context in which they were learned.6 Unlike episodic memory, which recalls the *experience* of learning a fact, semantic memory just knows the fact itself.13 In AI, semantic memory is often represented by the model's parametric knowledge or external knowledge graphs that provide universal context.1

### **Non-Declarative Memory: The Procedural System**

Procedural memory is the unconscious store of skills and "how-to" knowledge, such as riding a bike or typing on a keyboard.6 Often referred to as "muscle memory," it is stored in the basal ganglia and cerebellum.13 For autonomous agents, procedural memory is arguably the most critical and yet least developed area. It involves the solidification of successful reasoning patterns and tool-use sequences into repeatable, automated subroutines.19 By distilling past trajectories into script-like abstractions, agents can transform complex, unfamiliar missions into routine procedures, significantly reducing computational overhead and error rates.19

## **Mathematical Formalisms of Memory Persistence**

Developing artificial memory requires more than just storage; it requires an implementation of the biological processes of encoding, consolidation, and retrieval.8

### **The Ebbinghaus Curve and Activation Logic**

The probability of recalling a memory is governed by its "activation" level, which decays over time if not reinforced.21 Hermann Ebbinghaus first mapped this decay exponentially, showing that nearly 70% of new information is forgotten within 24 hours without review.21 This is represented by the forgetting curve:

![][image2]  
Where ![][image3] is the retrievability (or probability of recall), ![][image4] is the time since encoding, and ![][image5] is the strength of the memory trace.24

The ACT-R architecture formalizes this through the Base-Level Activation equation, which calculates the current strength (![][image6]) of a memory based on its historical usage 22:

![][image7]  
In this model, ![][image8] is the number of times the memory has been retrieved, ![][image9] is the time elapsed since the ![][image10] retrieval, and ![][image11] is the decay parameter (typically set to 0.5).22 This formula ensures that memories that are accessed frequently and recently remain highly accessible, while those that are irrelevant gradually fade—a feature that prevents artificial systems from being overwhelmed by historical noise.25

### **Spreading Activation and Associative Retrieval**

Biological memory is inherently associative; activating one concept triggers related concepts through a process called spreading activation.27 When an agent is queried, the input signal injects "energy" into specific nodes in its memory graph. This energy then propagates through causal and temporal edges, retrieving structurally salient information even if it lacks direct semantic similarity to the query.28

The activation of a chunk ![][image12] (![][image13]) in a network is defined as:

![][image14]  
Where ![][image6] is the base activation, ![][image15] represents the attentional weighting of elements in the current context, and ![][image16] is the strength of association between context element ![][image17] and chunk ![][image12].22 This mechanism allows an agent to maintain a "multifocal window" of awareness, where relevant but not explicitly mentioned facts are brought into the conscious workspace.31

## **Structural Organizations of Synthetic Memory**

Existing research on autonomous agents has categorized memory organization into three primary paradigms: temporal flow, hierarchical flow, and symbolic libraries.32

### **Multi-Layered Memory Hierarchies**

State-of-the-art frameworks like FluxMem and Memory Bear employ a three-layer hierarchy to manage cognitive load.33

| Layer | Temporal Scope | Primary Data Structure | Function |
| :---- | :---- | :---- | :---- |
| **Short-Term (STM)** | Immediate Session | Linear Thread / Buffer | Maintaining conversational coherence within a single interaction.2 |
| **Mid-Term (Episodic)** | Specific Contexts | Structured Graphs / Episodes | Storing interaction logs and user preferences across multiple sessions.33 |
| **Long-Term (Semantic)** | Generalized Knowledge | Vector Databases / Ontologies | Retaining stable facts, rules, and distilled abstractions.33 |

This organization allows for the "Stanford-style" reflection mechanism, where episodic logs are periodically synthesized into higher-level semantic nodes.35 By analyzing the importance and relevance of recent events, the agent generates "reflections"—abstract thoughts that are then stored as long-term memories to guide future behavior.35

### **The Agent Cognitive Compressor (ACC)**

One of the most significant challenges in long-running agent deployments is "summarization drift," where repeated compression passes cause critical low-frequency details to vanish.37 The Agent Cognitive Compressor (ACC) addresses this by replacing raw transcript replay with a bounded Compressed Cognitive State (CCS).38

The CCS explicitly separates "artifact recall" (fetching potential information) from "state commitment" (updating the agent's core beliefs and constraints).38 This ensures that the agent preserves high-value invariants—such as goals, policy constraints, and entity identifiers—while ignoring temporary distractions.38

## **Rust Data Structures for Cognitive Memory Systems**

Implementation of these architectures requires a language capable of managing complex, potentially cyclic graph structures and high-dimensional vectors with high performance and safety.4 Rust's ownership model is particularly suited for managing the lifecycle of Cognitive Memory Units (CMUs).

### **Defining the Cognitive Memory Unit (CMU)**

A CMU is a structured container holding not just information, but the metadata and relationships that make that information actionable for reasoning.2

Rust

use std::collections::HashMap;  
use std::time::{SystemTime, UNIX\_EPOCH};  
use uuid::Uuid;

/// Represents the temporal and functional role of the memory unit,  
/// mirroring human memory subsystems.  
\#  
pub enum MemoryTier {  
    Sensory,    // Raw signal data (ms-sec)  
    Working,    // Active reasoning workspace (seconds-minutes)  
    Episodic,   // Contextual events (days-weeks)  
    Semantic,   // Generalized knowledge (months-years)  
    Procedural, // Automated skills and tool protocols  
}

/// Content variants for multimodal memory support.  
\#  
pub enum MemoryContent {  
    Text(String),  
    Embedding(Vec\<f32\>),  
    KnowledgeTriple { subject: String, predicate: String, object: String },  
    ProceduralSkill { name: String, logic\_ref: String },  
}

/// Metadata structure implementing ACT-R and Ebbinghaus principles.  
\#  
pub struct MemoryMetadata {  
    pub created\_at: u64,  
    pub last\_accessed: u64,  
    pub access\_count: u32,  
    pub importance: f32,       // \[0.0, 1.0\] \- Extracted via salience models  
    pub base\_activation: f32, // Calculated based on frequency/recency  
    pub decay\_rate: f32,      // Tier-specific decay constant  
}

impl MemoryMetadata {  
    pub fn new(importance: f32, decay\_rate: f32) \-\> Self {  
        let now \= SystemTime::now()  
           .duration\_since(UNIX\_EPOCH)  
           .expect("Time moved backward")  
           .as\_secs();  
        Self {  
            created\_at: now,  
            last\_accessed: now,  
            access\_count: 1,  
            importance,  
            base\_activation: 1.0,  
            decay\_rate,  
        }  
    }  
}

/// The atomic Cognitive Memory Unit (CMU).  
\#  
pub struct CMU {  
    pub id: Uuid,  
    pub tier: MemoryTier,  
    pub content: MemoryContent,  
    pub metadata: MemoryMetadata,  
    pub tags: Vec\<String\>,  
}

### **Implementing the Associative Graph**

Biological memory retrieval relies on connectivity.9 In Rust, the petgraph library is often used to implement these networks, but care must be taken to manage ownership.39

Rust

use petgraph::graph::{NodeIndex, DiGraph};  
use petgraph::visit::EdgeRef;

/// A graph-based memory store that supports spreading activation.  
pub struct MemoryGraph {  
    pub inner: DiGraph\<CMU, f32\>, // f32 represents associative strength  
    indices: HashMap\<Uuid, NodeIndex\>,  
}

impl MemoryGraph {  
    pub fn new() \-\> Self {  
        Self {  
            inner: DiGraph::new(),  
            indices: HashMap::new(),  
        }  
    }

    /// Stores a new memory and creates associations with existing nodes.  
    pub fn remember(&mut self, unit: CMU, associations: Vec\<(Uuid, f32)\>) \-\> Uuid {  
        let id \= unit.id;  
        let index \= self.inner.add\_node(unit);  
        self.indices.insert(id, index);

        for (target\_id, strength) in associations {  
            if let Some(\&target\_index) \= self.indices.get(\&target\_id) {  
                // Create bi-directional links mirroring neural networks  
                self.inner.add\_edge(index, target\_index, strength);  
                self.inner.add\_edge(target\_index, index, strength \* 0.5); // Feedback link  
            }  
        }  
        id  
    }

    /// Implements spreading activation logic across the graph.  
    pub fn retrieve\_context(&self, seeds: Vec\<Uuid\>, iterations: usize) \-\> Vec\<Uuid\> {  
        let mut activations: HashMap\<NodeIndex, f32\> \= seeds.iter()  
           .filter\_map(|id| self.indices.get(id).copied())  
           .map(|idx| (idx, 1.0))  
           .collect();

        for \_ in 0..iterations {  
            let mut next\_gen \= activations.clone();  
            for (idx, \&score) in activations.iter() {  
                for edge in self.inner.edges(\*idx) {  
                    let target \= edge.target();  
                    let weight \= edge.weight();  
                    // Apply fan effect: spread decreases with number of outgoing links  
                    let outgoing\_count \= self.inner.edges(\*idx).count() as f32;  
                    let spread \= (score \* weight) / outgoing\_count.sqrt();  
                    \*next\_gen.entry(target).or\_insert(0.0) \+= spread;  
                }  
            }  
            activations \= next\_gen;  
        }

        // Return IDs of nodes sorted by total activation  
        let mut results: Vec\<(Uuid, f32)\> \= activations.into\_iter()  
           .map(|(idx, score)| (self.inner\[idx\].id, score))  
           .collect();  
        results.sort\_by(|a, b| b.1.partial\_cmp(\&a.1).unwrap());  
        results.into\_iter().map(|(id, \_)| id).collect()  
    }  
}

## **Management Lifecycle: Consolidation and Pruning**

Memory without forgetting is as problematic as no memory at all.1 In biological systems, forgetting is an "active process of strategic placement".41 Artificial agents must implement pruning to prevent retrieval noise and computational bloat.26

### **Pruning and Semantic Fusion**

The maintenance workflow involves three critical stages: modeling, identification, and fusion.34

1. **Modeling:** Every memory fragment is converted into high-dimensional semantic vectors for similarity analysis.34  
2. **Identification:** The algorithm identifies "redundant" information (duplicates), "irrelevant" information (task-unrelated chatter), and "outdated" information (expired facts).34  
3. **Fusion:** For different types of redundancy, the agent applies differentiated strategies. Entirely duplicated content is removed; semantically similar but differently phrased content is merged into a unified, concise expression; and obsolete data is decayed out of the system.34

| Pruning Strategy | Method | Application |
| :---- | :---- | :---- |
| **Deduplication** | Cosine Similarity \> 0.95 | Removing identical interaction logs.34 |
| **Temporal Decay** | ACT-R Base-Level Equation | Lowering activation of unused notifications.22 |
| **Semantic Merging** | LLM-as-a-Judge Synthesis | Combining five episodic instances of "User likes coffee" into one semantic fact.34 |
| **Contextual Culling** | Importance Scoring | Removing low-value observations when memory count exceeds a cap.35 |

### **Implementing the Decay Worker in Rust**

A maintenance routine can be implemented to run periodically, mimicking the human sleep/consolidation process.9

Rust

impl MemoryGraph {  
    /// Maintenance cycle to consolidate and prune memories.  
    pub fn maintenance\_cycle(&mut self, threshold: f32) {  
        let now \= SystemTime::now()  
           .duration\_since(UNIX\_EPOCH)  
           .unwrap()  
           .as\_secs();

        let mut to\_remove \= Vec::new();

        for node\_idx in self.inner.node\_indices() {  
            let unit \= &mut self.inner\[node\_idx\];  
            let elapsed \= now \- unit.metadata.last\_accessed;

            // Update activation using the ACT-R decay formula  
            // We use a simplified ln(1/t^d) model for single instances  
            let decay \= (elapsed as f32 / 3600.0).powf(-unit.metadata.decay\_rate);  
            unit.metadata.base\_activation \*= decay;

            // Retention score combines internal importance and usage frequency  
            let retention\_score \= unit.metadata.base\_activation   
                \* unit.metadata.importance   
                \* (unit.metadata.access\_count as f32).log2().max(1.0);

            if retention\_score \< threshold && unit.tier\!= MemoryTier::Semantic {  
                to\_remove.push(node\_idx);  
            }  
        }

        for idx in to\_remove {  
            let id \= self.inner\[idx\].id;  
            self.inner.remove\_node(idx);  
            self.indices.remove(\&id);  
        }  
    }  
}

## **Advanced Architectural Paradigms: Actor Models and Distributed Storage**

For production-grade agents, memory cannot be a simple local variable. It must be an independent cognitive module that can survive system crashes and scale across distributed environments.1

### **The Actor-Based Memory Model (Ractor)**

The DANEEL project demonstrates the utility of the actor model for cognitive architectures.31 By implementing the memory system as a MemoryActor using the Ractor framework, developers can leverage Erlang-style supervision trees.31 If the memory processing logic crashes due to a malformed update, the supervisor can restart the actor, ensuring the "thought flow" of the agent remains continuous.31

In this paradigm, the agent does not "call functions" on a memory object; it sends "Messages" to the MemoryActor. This decoupling allows for asynchronous processing—the agent can continue thinking or acting while the memory system performs heavy-weight tasks like vector embedding or graph maintenance.5

### **Hybrid Storage Backends**

Persistent memory typically requires a combination of high-performance in-memory stores and durable databases.2

* **Redis Streams:** Often used as an "event store" for thought competition.15 Different cognitive actors (attention, salience, memory) act as competing consumers, processing various streams of raw observations.31  
* **Vector Databases (Qdrant/Milvus):** Used for storing high-dimensional embeddings of episodic and semantic memories.15  
* **Relational Databases (Postgres/pgvector):** Preferred for structured metadata, enabling complex SQL queries on timestamps, session IDs, and entity relationships.29

## **Continuous Evolution: From Reactive Agents to Cognitive Entities**

The ultimate goal of applying human memory systems to AI is to transition from reactive predictors into self-evolving agents.37 This requires a mastery of procedural memory—where the agent learns *how* to use its own cognitive modules more effectively.19

Through "Flow-based Policy Optimization," agents can optimize their own planning and retrieval strategies.45 By treating memory relevance as a learnable parameter, agents can adjust their activation and pruning thresholds based on task success, eventually developing "individual expertise" that differentiates one instance of an agent from another.2

The integration of these neurobiological insights with the safety and performance of Rust creates a robust framework for the next generation of synthetic intelligence.4 As these systems mature, the "Alignment Gap" between black-box models and human experts will continue to close, enabled by architectures that don't just process data, but truly *remember*.31 This cognitive foundation transforms AI from a stateless tool into a consistent collaborator, capable of navigating the dynamics and uncertainties of the real world with human-like persistence and reasoning.2

#### **Works cited**

1. 7 Steps to Mastering Memory in Agentic AI Systems \- MachineLearningMastery.com, accessed March 29, 2026, [https://machinelearningmastery.com/7-steps-to-mastering-memory-in-agentic-ai-systems/](https://machinelearningmastery.com/7-steps-to-mastering-memory-in-agentic-ai-systems/)  
2. What Is Agent Memory? A Guide to Enhancing AI Learning and Recall | MongoDB, accessed March 29, 2026, [https://www.mongodb.com/resources/basics/artificial-intelligence/agent-memory](https://www.mongodb.com/resources/basics/artificial-intelligence/agent-memory)  
3. Soar (cognitive architecture) \- Wikipedia, accessed March 29, 2026, [https://en.wikipedia.org/wiki/Soar\_(cognitive\_architecture)](https://en.wikipedia.org/wiki/Soar_\(cognitive_architecture\))  
4. Sarcouncil Journal of Engineering and Computer Sciences RUST: A Memory Leakage-Proof Way of Building Applications, accessed March 29, 2026, [https://sarcouncil.com/download-article/SJECS-437-2025-10-15.pdf](https://sarcouncil.com/download-article/SJECS-437-2025-10-15.pdf)  
5. State-of-the-Art GraphRAG Rust Implementation with Modular AI Architecture | by Carlo C., accessed March 29, 2026, [https://autognosi.medium.com/state-of-the-art-graphrag-rust-implementation-with-modular-ai-architecture-8c6baf5312cd](https://autognosi.medium.com/state-of-the-art-graphrag-rust-implementation-with-modular-ai-architecture-8c6baf5312cd)  
6. Types of Memories and Their Functions \- WebMD, accessed March 29, 2026, [https://www.webmd.com/alzheimers/types-of-memory](https://www.webmd.com/alzheimers/types-of-memory)  
7. The Neuroanatomical, Neurophysiological and Psychological Basis of Memory: Current Models and Their Origins \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC5491610/](https://pmc.ncbi.nlm.nih.gov/articles/PMC5491610/)  
8. 7.5 Memory Processes: Encoding – Cognitive Psychology, accessed March 29, 2026, [https://nmoer.pressbooks.pub/cognitivepsychology/chapter/three-processes-of-learning-and-memory/](https://nmoer.pressbooks.pub/cognitivepsychology/chapter/three-processes-of-learning-and-memory/)  
9. The Cognitive Processes behind Memory Formation and Retrieval \- Longdom Publishing, accessed March 29, 2026, [https://www.longdom.org/open-access/the-cognitive-processes-behind-memory-formation-and-retrieval-105890.html](https://www.longdom.org/open-access/the-cognitive-processes-behind-memory-formation-and-retrieval-105890.html)  
10. What is an attention mechanism? | IBM, accessed March 29, 2026, [https://www.ibm.com/think/topics/attention-mechanism](https://www.ibm.com/think/topics/attention-mechanism)  
11. Introducing EmbedAnything : A lightweight multimodal embedding library made in Rust, accessed March 29, 2026, [https://app.readytensor.ai/publications/introducing-embedanything-a-lightweight-multimodal-embedding-library-made-in-rust-HRa5fXfK7DZs](https://app.readytensor.ai/publications/introducing-embedanything-a-lightweight-multimodal-embedding-library-made-in-rust-HRa5fXfK7DZs)  
12. Types of Memory | Psychology Today, accessed March 29, 2026, [https://www.psychologytoday.com/us/basics/memory/types-of-memory](https://www.psychologytoday.com/us/basics/memory/types-of-memory)  
13. What is Memory? \- HappyNeuron Pro, accessed March 29, 2026, [https://www.happyneuronpro.com/en/info/what-is-memory/](https://www.happyneuronpro.com/en/info/what-is-memory/)  
14. Deconstructing ACT-R, accessed March 29, 2026, [http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/641stewartPaper.pdf](http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/641stewartPaper.pdf)  
15. How to Build AI Agents with Redis Memory Management, accessed March 29, 2026, [https://redis.io/blog/build-smarter-ai-agents-manage-short-term-and-long-term-memory-with-redis/](https://redis.io/blog/build-smarter-ai-agents-manage-short-term-and-long-term-memory-with-redis/)  
16. Memory: Neurobiological mechanisms and assessment \- PMC \- NIH, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC8611531/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8611531/)  
17. Types of memory \- Queensland Brain Institute, accessed March 29, 2026, [https://qbi.uq.edu.au/memory/types-memory](https://qbi.uq.edu.au/memory/types-memory)  
18. What Is AI Agent Memory? | IBM, accessed March 29, 2026, [https://www.ibm.com/think/topics/ai-agent-memory](https://www.ibm.com/think/topics/ai-agent-memory)  
19. M⁢e⁢m^p: Exploring Agent Procedural Memory \- arXiv, accessed March 29, 2026, [https://arxiv.org/html/2508.06433v2](https://arxiv.org/html/2508.06433v2)  
20. Memp: Exploring Agent Procedural Memory \- OpenReview, accessed March 29, 2026, [https://openreview.net/pdf/edde9fd54693bf6fbf32461a612022100408d435.pdf](https://openreview.net/pdf/edde9fd54693bf6fbf32461a612022100408d435.pdf)  
21. Teaching Strategies for Students | The Ebbinghaus Forgetting Curve \- Structural Learning, accessed March 29, 2026, [https://www.structural-learning.com/post/ebbinghaus-forgetting-curve](https://www.structural-learning.com/post/ebbinghaus-forgetting-curve)  
22. Chapter 1: Modeling paradigms in ACT-R 1\. Introduction, accessed March 29, 2026, [https://www.ai.rug.nl/\~niels/publications/taatgenLebiereAnderson.pdf](https://www.ai.rug.nl/~niels/publications/taatgenLebiereAnderson.pdf)  
23. The Forgetting Curve: How AI Flashcards Combat Memory Decay \- StudyCards AI, accessed March 29, 2026, [https://studycardsai.com/blog/forgetting-curve-ai-solution](https://studycardsai.com/blog/forgetting-curve-ai-solution)  
24. Forgetting Curve \- The Decision Lab, accessed March 29, 2026, [https://thedecisionlab.com/reference-guide/psychology/forgetting-curve](https://thedecisionlab.com/reference-guide/psychology/forgetting-curve)  
25. TIL: The Ebbinghaus Forgetting Curve Predicts AI Agent Memory Decay Too \- Moltbook, accessed March 29, 2026, [https://www.moltbook.com/post/bd7eef9a-50e6-4381-a953-d9e886f3e84a](https://www.moltbook.com/post/bd7eef9a-50e6-4381-a953-d9e886f3e84a)  
26. Why memory pruning is essential for AI agents : r/AIMemory \- Reddit, accessed March 29, 2026, [https://www.reddit.com/r/AIMemory/comments/1qgpdxq/why\_memory\_pruning\_is\_essential\_for\_ai\_agents/](https://www.reddit.com/r/AIMemory/comments/1qgpdxq/why_memory_pruning_is_essential_for_ai_agents/)  
27. A spreading activation theory of memory \- ACT-R, accessed March 29, 2026, [http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/66SATh.JRA.JVL.1983.pdf](http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/66SATh.JRA.JVL.1983.pdf)  
28. Synapse: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation \- arXiv.org, accessed March 29, 2026, [https://arxiv.org/html/2601.02744v3](https://arxiv.org/html/2601.02744v3)  
29. How We Built Time-Aware Spreading Activation for Memory Graphs \- Hindsight \- Vectorize, accessed March 29, 2026, [https://hindsight.vectorize.io/blog/2026/03/12/spreading-activation-memory-graphs](https://hindsight.vectorize.io/blog/2026/03/12/spreading-activation-memory-graphs)  
30. A Metacognitive Classifier Using a Hybrid ACT-R/Leabra Architecture, accessed March 29, 2026, [https://cdn.aaai.org/ocs/ws/ws0750/3935-16734-1-PB.pdf](https://cdn.aaai.org/ocs/ws/ws0750/3935-16734-1-PB.pdf)  
31. mollendorff-ai/daneel: Cognitive architecture research ... \- GitHub, accessed March 29, 2026, [https://github.com/mollendorff-ai/daneel](https://github.com/mollendorff-ai/daneel)  
32. AI Meets Brain: A Unified Survey on Memory Systems from Cognitive Neuroscience to Autonomous Agents \- arXiv, accessed March 29, 2026, [https://arxiv.org/html/2512.23343v1](https://arxiv.org/html/2512.23343v1)  
33. Choosing How to Remember: Adaptive Memory Structures for LLM Agents \- arXiv, accessed March 29, 2026, [https://arxiv.org/html/2602.14038v1](https://arxiv.org/html/2602.14038v1)  
34. 0.1 Core technologies, application results, and future development directions of Memory Bear. \- arXiv, accessed March 29, 2026, [https://arxiv.org/html/2512.20651v2](https://arxiv.org/html/2512.20651v2)  
35. I'm obsessed with the Stanford Generative Agents paper and tried to build the ultimate memory architecture for an Android app : r/SillyTavernAI \- Reddit, accessed March 29, 2026, [https://www.reddit.com/r/SillyTavernAI/comments/1rjb4xd/im\_obsessed\_with\_the\_stanford\_generative\_agents/](https://www.reddit.com/r/SillyTavernAI/comments/1rjb4xd/im_obsessed_with_the_stanford_generative_agents/)  
36. \[R\] Generative Agents: Interactive Simulacra of Human Behavior \- Joon Sung Park et al Stanford University 2023 : r/MachineLearning \- Reddit, accessed March 29, 2026, [https://www.reddit.com/r/MachineLearning/comments/12hluz1/r\_generative\_agents\_interactive\_simulacra\_of/](https://www.reddit.com/r/MachineLearning/comments/12hluz1/r_generative_agents_interactive_simulacra_of/)  
37. Memory for Autonomous LLM Agents: Mechanisms, Evaluation, and Emerging Frontiers, accessed March 29, 2026, [https://arxiv.org/html/2603.07670v1](https://arxiv.org/html/2603.07670v1)  
38. AI Agents Need Memory Control Over More Context \- arXiv, accessed March 29, 2026, [https://arxiv.org/html/2601.11653v1](https://arxiv.org/html/2601.11653v1)  
39. Graphs and arena allocation | Rust for C++ Programmers \- aminb, accessed March 29, 2026, [https://aminb.gitbooks.io/rust-for-c/content/graphs/index.html](https://aminb.gitbooks.io/rust-for-c/content/graphs/index.html)  
40. petgraph \- Rust \- Docs.rs, accessed March 29, 2026, [https://docs.rs/petgraph/](https://docs.rs/petgraph/)  
41. A Practical Deep Dive Into Memory Optimization for Agentic Systems (Part A), accessed March 29, 2026, [https://www.dailydoseofds.com/ai-agents-crash-course-part-15-with-implementation/](https://www.dailydoseofds.com/ai-agents-crash-course-part-15-with-implementation/)  
42. memory \- AgentOS \- Mintlify, accessed March 29, 2026, [https://mintlify.com/iii-hq/agentos/api/rust/memory](https://mintlify.com/iii-hq/agentos/api/rust/memory)  
43. Organizing memory for multimodal (video \+ embeddings \+ metadata) retrieval \- looking for real systems / validation : r/Rag \- Reddit, accessed March 29, 2026, [https://www.reddit.com/r/Rag/comments/1ryv9i8/organizing\_memory\_for\_multimodal\_video\_embeddings/](https://www.reddit.com/r/Rag/comments/1ryv9i8/organizing_memory_for_multimodal_video_embeddings/)  
44. (PDF) Memory in LLM-based Multi-agent Systems: Mechanisms, Challenges, and Collective Intelligence \- ResearchGate, accessed March 29, 2026, [https://www.researchgate.net/publication/398392208\_Memory\_in\_LLM-based\_Multi-agent\_Systems\_Mechanisms\_Challenges\_and\_Collective\_Intelligence](https://www.researchgate.net/publication/398392208_Memory_in_LLM-based_Multi-agent_Systems_Mechanisms_Challenges_and_Collective_Intelligence)  
45. AgentFlow: In-the-Flow Agentic System Optimization \- Stanford University, accessed March 29, 2026, [https://agentflow.stanford.edu/](https://agentflow.stanford.edu/)  
46. Cognitive AI: Behavioral Models of Decision Making \- Carnegie Mellon University, accessed March 29, 2026, [https://www.cmu.edu/ai-sdm/research/research-highlights/cognitive-ai.html](https://www.cmu.edu/ai-sdm/research/research-highlights/cognitive-ai.html)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAXCAYAAACS5bYWAAABMklEQVR4Xu2VsWoCQRCGByGkENLF+AA+gOYBgo19Yps2IJY2voyNRSApxBQhRZqkTROwiJBHsLAOBAudce908rN3t3NXBfaDD+Tf2dm9O2+PKBI5cMd+si0cKMk9BgbG7Be7YC9gbM8Tu83Ryg8GgfyyI7ZObtOy9sefiiTssm32nK0l+QvbT35b2GAQgOxhzZ6obJ7kM5V5716PXWIYiK9fEelTnKjsUuW5FBbkUGbuLbui41MVrihgs/Kfa2BoILe5gUdyvd5xIOWVfcMwg/SqQz1z04KROQ8YaqTgBkMj0qMqzwQvlg9Z6BRDI1U3O6TAHkFFBVTp0SF33mq8/QaUMWCkbA/5YslZi3j7fVPGgJEyPaZ0fBFRffYemJJtIWxaZNNN84K12mtVF4lEIv+JHWIRZ+Q9UqhbAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAApCAYAAACIn3XTAAABcElEQVR4Xu3bMUrEQBQG4HTqCewsBXvFStATeA2xEMFePICljZ3oDay02QNYewALKy2tRWdYFsbnbBYhkrD5Pvhh878lO+UjYZsGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARmMjFgAADMtXLAAAGJabWAAAAABA7x5TXprp68bXlKeU0/ILA7IbCwCAscjL2l2lG4p8ljIXP6YAACNQW85qHQAAPaktZ7Wub/kp4H0sAQDGIC5n8bpLk5SdlJWUtzBr8xALAICxOEq5TTlIOW8WL2vbKfshudtMWU9Zm36t6j3lubj+KD4vks+Zz7YVBwAAyy4uaNeVriv5vpcpJ3HwB/91NgCAwYoL0OyfmPPM5m2Zp23W5rCZvhK9igMAgGW32vxeosql66wcdCD+1me4BgCgMO+p2HGl61Je0vK99+IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+vQNKHRCmdv1ttQAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAAxUlEQVR4XmNgGDbgCBDfA+JPQPwdiJ8A8WUg3gjEskjqcIL/UIwO+hgg4ivRJZABLs0ggE8ODECSR9EFgYCfgUjN3uiCQDCdASJ3F10CBlIYsJt8jgEibo0ugQzuMyCchozDkBXhAiCFbWhilQyQqCMIQJp50AUZIOLq6ILIIIEBu39BACQehy6IDGD+QwfNDBBxGXQJZIBL804GiDgHlJ8JxA4gRihUAh2zQBWCgD5UzJkBYgA2C/CCOiB+zADJIKNgBAEAGhQ5KHveZ1wAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAaCAYAAAB7GkaWAAAAaElEQVR4XmNgGBwgEl0ABk4D8X90QRgASfxGFwQBHgaIpCuy4C+oIDp2R1b0CSqIFYAkzqILggALA0QyFF0CBIoZCBiJLGkJxMwwDkhiCUIO1RQQpwnK3gPEikhyDHUMCKPNkCVGPAAAAT8cHWanhxQAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAZCAYAAADqrKTxAAAAsUlEQVR4XmNgGJJADYj/I+HbUPEzQMwCU4QMQIqOowsyIAzACnBJPAfireiCIODKgFvTZiC2QhcEgU4G3Jqq0QVggIcBNQBAeDuKChwAFFLoGk+jqMADQP7byYDQqIEqjR+IMUA0+aNLgACuAAABkJwCuqAvA25NrED8G10QBI4xQDSJoEswQMQ50AVBACQBigcQbQHE7EDsBuXD0h0GKENi9wPxZyCeCsTcSOKjYIgBAA/VLQWohVhjAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAZCAYAAAAxFw7TAAAA8ElEQVR4Xu2TvQ4BQRSFr8JfopSQaFUeQKKk9goanYLGA6iVnkGjU6iEaBRKotFpdYhOxZnMjJ3cncwO2yj2S75iz5l7M9nNEiWAPbzAF7zDMzzCHVzBTHDUnxvJhWVekMyFX+Ea0l2eFy58FnrTJTkw5oVCdAseurDdoAg3Ks+yLhK9UHxR7Ro+Yd84541YtuShQnQzHkYhhto8VBwo/Do6luxDjRwleJC7D3El+a5s1EkumxpZCk6M5xBiYMRD0CL71xd/1BYOzLBJwWGXJz2gKMCK6nKsiwW/dSwasAR7vPiVIUzDOS/iUOVBwp/xBkmdRAQHlGTiAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABCCAYAAADqrIpKAAAE00lEQVR4Xu3dO6gjVRgH8OMLFh/go5HFykehhZUvRLirso2KLwQLFW6hFiLa+GARtRDBRyVYCeKiIoqF2mihrYquosViJ4qFIDaihaiIzvFmvJNvk0zmkdxk8vvBR2a+M8mZ6f5McjIpAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtHc0NlbYJ7EBADB0txR1c2yusMdiAwBg6P6JjRmeH72+O9ZdvibnDACw1n6NjRmOpPGg9GNle9kuKeqH2AQAGKKmd6rK4+8o6ozqwB5oeu4AAGvn76Kujc0ah0avqxCWHknN7hACAKydrqHrlNjYA12vAQBgZb2Ydu6wrbsc2B6OTQCAIchB57rYXEMPJXfZAICBGlLIGdK1AAD857k0O+Qc6FjLlq/lvtgEAFhnOeDMCmzl+DtxYIqr0u57cj07PtzZt0V9EZsVddcDALB2crg5HJtBGYKargR9OfUfnraKOjM2Kz5I/c8JALCncri5ODaDs1P7O1fnF3VhbHZQdw53p/pjAIANVP0KsKzPx45YjHKuO+NAA/OGm+q1NfV4bLRQzls3//5UfwwAsKEmhYRJvb51CWwnpmbnWAa2v+JAS89Utk9Ixy5YyJVVz/G1yvY0Ta4JANgQxxf1W2ym5QSHLoHtxtT8HMvQdk8caGHeucvjyoC3VQ5MMe/nAgAb5O20szqyKoeG80JvEfI8d422t4t6dbT9aKpfTPBAah5unkq7oa2ti9LO3bP8GdeMD010XNpZHXpWmr1CtNTl3ACAgSoDTFl/FHXO2BGz5d94zaordg89RjWwlfsfj7bzqs5Z4eXpNHt8mvI6P4oDDbWZex6L+lwAYI1NCgixd27Y70uep/qVaJw37ld1+duNMrSdFgfm9ERRv8RmT9peEwAwUPnH8pMCQuwdDvt96RLYXkmzx+vk994bm3PK7700NnvS5ZoAgAHKiw3yV6BVl6Xx0PB6ZXuSAzWVf7s1TZfAVv4erY3L0+w/sK1Tzhu/7s3X+lXoNdX2mgCAgcrh4GBl/41Rb99oP//z/ulF3f7/Ef3Kc70w2s4/zq+GlSvDftRm0UGp7ftK5fvz17J963puAMAGWtUAcXVqd25t3hPlQFtdLJG9WdR7oddGH+cHAGyYHCDuj80V0TTcND2+qXKFaxeLPkcAYIB+L+rU2FwRTcJNk2Or8vXPq+0cpZNT988AAFgpOdzkB7TXyQsr8v+6NfVz2nkSxLy6hq3bUvfPAABYKTncvBWbwaexUSOvHs3PG82f3SQ83ZSa/eHwJF+nZnMCAKy8ulC1nXaPaVM5hNXJD6F/sqif4kAL5bwAAIPxYBpWwMnXckNsAgCsu6EFNgCAwckhZ39srqHrk8AGAAzUZ0V9E5trKIe1/KQJAIBB6vvO1Kznny5K39cAALBS8grN7dgM8qOs8vNK6+Tnpy47PB0q6svYBAAYmj5DVp+fNY9lzwcAsCeOxEbFwaK+r+x/OKVKywxQW8lv1wCADfJdbFQ0CWFNju1qmXMBAOy5vGJ02u/UqsEob0+q6vgynBQbAACb4P3YKNxa1AWxOcWkALcI+4p6KTYBADbR0aL+jE0AAFbHou+UAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa+5fvtkZRx/tIkkAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAYCAYAAADOMhxqAAAAiUlEQVR4XmNgGAU0BIxAvBiIg5HEAoF4E1QOA/xngEiAaFUg/gzEykBsBBVDAbuAmBnKBkl6IcnBxMKQBeygtDMDFtMYIGKs6IIgsJcBU4MMFjE4AEm8wyKWBGVnIEtwMEAki5AFoWIw8B6JzVDBgGk1J5LYaiCWQpJj0EMXgAIWIHZHFxwFAw8A/eQaEYKQ7qcAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAaCAYAAACHD21cAAAArElEQVR4XmNgGJkgB12AGNAPxP/RBYkBIE1ka5yALogLfGdA2ISMiQYXGEjUAAMk2wQDIE0T0QWRgCgQP0cXDGOAaBRCl0AChkA8B10Q3ZlVSGy8AKTpChL/IhIbBDYB8XsgFkATB2vcAGUXIUsAwRQo/YEBU44hgwHh3HQ0ORgAybGgCxIDyIqqZCD+hS5IDHgFxNXogsQAkpzpyoDQcB5ZghgA0rgXXXCIAQADSStKp4715gAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAAA+klEQVR4XmNgoAx0A/F/IJZHlyAHgAwSwiJGFYBukDUWMZJBLRBPYYAYBGLzQMU3A/EiIPaGihMFqhggBoE0w8BXII5B4oMASE0TlA2yZD6SHF4QjcZH9z4TmthfIA5E4hMN2BkwDc8H4hdIfHR5okEdEF+Fsquh9DMgzoOyQeA7lF6GJIYCHgCxFQPEFa+RxIWhYiB5GEB3KShO9qKJwcEkILaEskEa0TVTBJANA7Fh3qQ6QE5iVAcgw2EZharAiIHK4Y0M1gLxcXRBagGQqz3QBakFqBokJ4E4DspuYKCy4SDDQDmLGcpegSpNGYDlRhDORZMbBaMAAQBH2Tr+988XvgAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAn0lEQVR4XmNgGJRAA4j/I2G8QJ6BSIUgAFK0Bl0QHTgwQBSaooljgF8MOKz1YIBIfAPiVij7M4oKIFgNlYABkAIQvxZJjCEcKiiLJJYPFeNAEsMaBM/QxfihAtuQBaFiIM/AwWSooBSSGCxWvKH8DBARDRVEBluRxESAuBcmARKMhLI5GRA+BoFLUBoMWBkgYQeSPAcVuwXlw00bBXQEAKWYLjl1qRZKAAAAAElFTkSuQmCC>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAZCAYAAAD9jjQ4AAAAbElEQVR4XmNgGHjQCMT/gbgHXQIGMtAFyAcvgNiMAWLfAWQJNyBOgbJBkiAMBzAOE5SdiSQHB1MZ0HQhA5DEa3RBEAhngEgyQ/m/kOQYfjMgjAQFghOSHMNaBoikFhC/RJaAAT8gtkYXHAkAAGNQFiBgoGRfAAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAZCAYAAAAxFw7TAAAAxklEQVR4XmNgGE7AAV2AEjABiP+jC5IL/BgghlHNQJhhIKyIJkcWSATixwwQA33R5EgGZ6D0RgaIgZVIciSD6UCcDmWXMUAM3I6QJg0wMqBGQhCU/xRJjCTwDIglkfh6DBTEtAYDasyiY3QwiwG7OBzgksRlIF6gCsQC6IJQgM1APiCuRxODA2YGTA3IAJuBx6BiBsiCNlBBGP6LLIkmB8NLgNgbSZ6q4CW6ACWgHEovQxGlAGwAYjEgLkCXoASIoguMgkEGABtyOCZdfQKIAAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA5CAYAAACLSXdIAAADpklEQVR4Xu3dzct8YxgH8BvZiJAosWFBURQbslEkL0VZkGxE+ROUhaywpJQF2bDxtmGlSL+IKC+l7MRGJAuhbCyYqzl3c8/1ux+/M2dmHmPm86mrc873njPnnGfzXJ2XOaUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAw/h7qvRH1c/P5WgAAbNktZVrzdXeZr/NbHgAAYPNqw/ZFHhhh1UYPAGBjjrsRyZcaa93ZfmiL6vY+yAMTXFqWjyE818lCL+u5psw/8/2s3pnV58vDAMChGdNAbMO75eTtxvL7KduGy8riuM9PY1PlY7m/k4WXc5DcXub30FWPlv73AAAHIs7knFv+m4YgtvlEJ1t1X27LwUjflmnbO0r+nhOdLC/39D7zZg4AgMNRm4Nek7BtvW1GdnEOT+GuHKygNmz35oEJ8vE82MnGiHXOTtlpaRkAOBAvNPNTGot1nF6Wt3ndsDylMbknByuqTdu62u/oNcJjt1H3J+rE8hAAcGhebeanNktTxSW+toE5Y1i+osnGWrdhi7Nrm2ja6vpnDtVmDwzTsZ4pi336Ko0BAAcino5sz+RExU3yrTvS8ibF9m5O2ZNDXr3UzLfOK/N1az2elqMuKKupf4N1HkCo+94+VFCzq5us1T5cEOKewiw3ktHcXj/M5/UBgD3yfFqOpuDFlB0l7q/KzV6u+KmLf5ObkFDXXdW6Z9jCR2X9nxSJff+wk61yTNGMZm/nAADYf70GIrLvhvkvy3bPrtW3DbQ+SVl9s8AYm2jYXs/BBLG/t3aynoeHaR7/MS3nNyu8URbr1svIAMAeeawszvi0/+jbrObbagTytqL+LP2f5vg6B0dYt2Hb1LH2vqeXtdrLvs8O0/Zv07tE+9cwvWhW97UDAMBh+WVWN+bwGL01TM9ZSvvWadhO1VBt01M5GGnbTTUA8D8QP7kR96DdkAeOUTQjj+Rww/6Y1Vk5PEZTG64fhmms/2k7AACwT6LRuSmHI7yWgzVMadjibOIlOQQA2DdTGqWHyuK+snVdVU5+SneM2PaFOQQA2DeXz+qbMv/9slofl/kDDvFu0Z9m9XtZvvG/rWsLAABblRuwVQsAAAAAAAAAAAAAADhgHi4AAAAAgKni/Z7xMnoAAHbQr8PUJVEAgB33Sg4AANgdn+UAAIDd4nIoAMCOikbt6VldmQcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANgh/wDRj/UzN3cOiQAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABPklEQVR4Xu2UMUsDQRCFpwySNGJSiWAtWNgYBLs0YmVhay/YCP4NhfwBQSzsLAW1SqWNRQKCaGElKnb+AZ1hZ8jwuFl1T63yweP23uNmdpfbJZpQkw/WHetS9e6yJ+ebjHXn3bLeXBayTalhFeKLFjBQLtDI0aO40QulbA0DZg+Nr5inVGwGAxqvaAcDiieXRT7qgtdmHWt2ANkpaxa8b1E1a/F29Tlw/iYVbJuBs5Y/qcXa0OzVZUVbZsjHsh2CNLjW8aJmVvyItaTjIqTQ0I2NKX03z5+ziOyKrdgKaz/IGuAXYcWuMKBxlp0ppUN9hiZyT3EhayK/e8Qya1XHcgGEnLP6aCrS5AFN4FGfW6xpHyB4ID3RSqsYofFX/GRSxXTonxodsm7Q/C3mWM86ltXUujVyNCk1OMFgQm0+AY/KUkZMwGZ/AAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAABHUlEQVR4XmNgGAUkAAMg/o+EL0DFH8FVkAlKgHg3uiADwiKKAC4DQOIT0QVJAYEMuA2/AsQi6IKkgAkMuA2nyNUgIMiAGpEgvB5FBYXAkQHTgq0oKqgAPIF4LwPCAjZUaeoANQaI4broEkCwgQE1jkDsxUh8OMAVkSAAkmNCFyQWBDPgNlwciD+gCwLBAiAuR+JPBWJrJD4cnGaAGA5KLegAm6V2UBokZwrEMkh8DAASrITSLQyQyINlqLNI6mDgBpQGyXMwQBxnA+VjgCIkdgoQfwbifiBmRxLHBpANewXE8Uh8isA8IN6PxIdZ9ARJjGwAMswJiX+MARK0VMkP6OHrAMTMaGIkATkgfg5loxtOMeBhgBi6BF1iFBANAOeNRFtTH9W+AAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAZCAYAAADjRwSLAAAAfElEQVR4XmNgGDqgFIj/A/FudAl0EIcuQH3wAIhtGSDu+YQqBQGTgNgOyv7LAFGIAZAFQexfSHysAKSoC10QHYAUCaELIgMdBhzuQQbLgfgcuiA6AJnijy6IDrBadRKI46HsGgYcikCC+4GYCcpehSoNASAJGC5AkxvaAAAbCBxgzzQp9gAAAABJRU5ErkJggg==>