export const stats = [
  { label: "Notes Uploaded", value: 24, change: "+3 this week", icon: "FileText" },
  { label: "Flashcards Generated", value: 312, change: "+48 this week", icon: "Layers" },
  { label: "Quizzes Completed", value: 18, change: "+5 this week", icon: "ClipboardCheck" },
  { label: "Study Streak", value: "12 days", change: "Personal best!", icon: "Flame" },
];

export const recentUploads = [
  {
    id: "1",
    name: "Data Structures - Trees.pdf",
    date: "2 hours ago",
    size: "2.4 MB",
    type: "pdf",
  },
  {
    id: "2",
    name: "Operating Systems Notes.docx",
    date: "Yesterday",
    size: "1.1 MB",
    type: "docx",
  },
  { id: "3", name: "Machine Learning Basics.pdf", date: "2 days ago", size: "4.7 MB", type: "pdf" },
  { id: "4", name: "Database Management.pdf", date: "4 days ago", size: "3.2 MB", type: "pdf" },
  { id: "5", name: "Computer Networks.txt", date: "1 week ago", size: "320 KB", type: "txt" },
];

export const recentQuizzes = [
  { id: "1", title: "Binary Trees Quiz", score: 92, total: 10, date: "Today" },
  { id: "2", title: "OS Process Scheduling", score: 78, total: 15, date: "Yesterday" },
  { id: "3", title: "ML Fundamentals", score: 85, total: 12, date: "3 days ago" },
];

export const weeklyActivity = [
  { day: "Mon", hours: 2.5, quizzes: 1 },
  { day: "Tue", hours: 3.2, quizzes: 2 },
  { day: "Wed", hours: 1.8, quizzes: 1 },
  { day: "Thu", hours: 4.1, quizzes: 3 },
  { day: "Fri", hours: 2.9, quizzes: 2 },
  { day: "Sat", hours: 5.2, quizzes: 4 },
  { day: "Sun", hours: 3.6, quizzes: 2 },
];

export const learningProgress = [
  { subject: "Data Structures", progress: 78 },
  { subject: "Operating Systems", progress: 62 },
  { subject: "Machine Learning", progress: 45 },
  { subject: "DBMS", progress: 88 },
  { subject: "Networks", progress: 30 },
];

export const upcomingSessions = [
  { id: "1", title: "Graph Algorithms", time: "Today, 4:00 PM", subject: "DSA" },
  { id: "2", title: "Memory Management", time: "Tomorrow, 10:00 AM", subject: "OS" },
  { id: "3", title: "Neural Networks", time: "Wed, 2:00 PM", subject: "ML" },
];

export const flashcards = [
  {
    id: "1",
    question: "What is a Binary Search Tree?",
    answer:
      "A node-based binary tree where the left child contains values less than the parent and the right child contains values greater than the parent.",
  },
  {
    id: "2",
    question: "What is Big O notation?",
    answer:
      "A mathematical notation that describes the limiting behavior of a function, used to classify algorithms by their runtime or space requirements.",
  },
  {
    id: "3",
    question: "Define recursion.",
    answer:
      "A method of solving a problem where the solution depends on solutions to smaller instances of the same problem.",
  },
  {
    id: "4",
    question: "What is a Hash Table?",
    answer:
      "A data structure that implements an associative array, mapping keys to values using a hash function.",
  },
  {
    id: "5",
    question: "Explain Dijkstra's Algorithm.",
    answer:
      "An algorithm for finding the shortest paths between nodes in a weighted graph using a greedy approach with a priority queue.",
  },
];

export const quizQuestions = [
  {
    id: "1",
    question: "What is the time complexity of searching in a balanced BST?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct: 1,
  },
  {
    id: "2",
    question: "Which traversal visits root → left → right?",
    options: ["Inorder", "Preorder", "Postorder", "Level-order"],
    correct: 1,
  },
  {
    id: "3",
    question: "A heap is typically implemented using which data structure?",
    options: ["Linked List", "Array", "Tree", "Hash Table"],
    correct: 1,
  },
  {
    id: "4",
    question: "Which sorting algorithm has the best average-case complexity?",
    options: ["Bubble Sort", "Insertion Sort", "Quick Sort", "Selection Sort"],
    correct: 2,
  },
  {
    id: "5",
    question: "What does DFS stand for?",
    options: [
      "Data First Search",
      "Depth First Search",
      "Direct File System",
      "Dynamic Function Set",
    ],
    correct: 1,
  },
];

export const chatHistory = [
  { id: "1", title: "Binary Trees Explained", time: "2h ago" },
  { id: "2", title: "OS Scheduling Algorithms", time: "Yesterday" },
  { id: "3", title: "Neural Network Basics", time: "2 days ago" },
  { id: "4", title: "SQL Joins Deep Dive", time: "Last week" },
];

export const testimonials = [
  {
    name: "Priya Sharma",
    role: "CS Student, IIT Delhi",
    avatar: "PS",
    quote: "StudyMate AI cut my exam prep time in half. The auto-generated flashcards are gold.",
  },
  {
    name: "Arjun Mehta",
    role: "Med Student, AIIMS",
    avatar: "AM",
    quote:
      "I upload my lecture notes and get clean summaries instantly. It's like having a personal tutor.",
  },
  {
    name: "Sara Khan",
    role: "Engineering, BITS Pilani",
    avatar: "SK",
    quote:
      "The quiz generator catches the exact topics I struggle with. My grades jumped a full letter.",
  },
];
