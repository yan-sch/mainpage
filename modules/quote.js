const QUOTES = [
  { text: "Der beste Weg, die Zukunft vorherzusagen, ist sie zu gestalten.", author: "Peter Drucker" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Der einzige Weg, gute Arbeit zu leisten, ist zu lieben, was man tut.", author: "Steve Jobs" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Wachstum beginnt am Ende deiner Komfortzone.", author: "Neal Donald Walsch" },
  { text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan" },
  { text: "Disziplin ist die Brücke zwischen Zielen und Leistung.", author: "Jim Rohn" },
  { text: "The best investment you can make is an investment in yourself.", author: "Warren Buffett" },
  { text: "Measure twice, cut once.", author: "Carpenters' proverb" },
  { text: "Erfolg ist die Summe kleiner Anstrengungen, die Tag für Tag wiederholt werden.", author: "Robert Collier" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "Gestern hast du gesagt, du machst es morgen.", author: "Nike" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Qualität ist kein Zufall. Sie ist immer das Ergebnis angestrengten Denkens.", author: "John Ruskin" },
  { text: "Move fast and learn things.", author: "Engineering wisdom" },
  { text: "Ein Experte ist jemand, der alle Fehler gemacht hat, die in einem sehr engen Fachgebiet gemacht werden können.", author: "Niels Bohr" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Schreibe Code, als würde ihn der nächste Maintainer ein Psychopath kennen, der weiß, wo du wohnst.", author: "John F. Woods" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Fange an, und die Kraft kommt.", author: "Goethe" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Wer aufhört, besser werden zu wollen, hört auf, gut zu sein.", author: "Philip Rosenthal" },
  { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
  { text: "Ich habe keine Misserfolge. Ich habe nur 10.000 Wege entdeckt, die nicht funktionieren.", author: "Thomas Edison" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Simplicity is a great virtue but it requires hard work to achieve it.", author: "Edsger Dijkstra" },
];

export function initQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quote-text').textContent   = q.text;
  document.getElementById('quote-author').textContent = '— ' + q.author;
}
