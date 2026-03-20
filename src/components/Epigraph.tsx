"use client";

import { useState } from "react";

const QUOTES = [
  { text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", author: "Jane Austen", work: "Pride and Prejudice" },
  { text: "Call me Ishmael.", author: "Herman Melville", work: "Moby-Dick" },
  { text: "It was the best of times, it was the worst of times.", author: "Charles Dickens", work: "A Tale of Two Cities" },
  { text: "Beware; for I am fearless, and therefore powerful.", author: "Mary Shelley", work: "Frankenstein" },
  { text: "All happy families are alike; each unhappy family is unhappy in its own way.", author: "Leo Tolstoy", work: "Anna Karenina" },
  { text: "It was a bright cold day in April, and the clocks were striking thirteen.", author: "George Orwell", work: "Nineteen Eighty-Four" },
  { text: "In the beginning God created the heaven and the earth.", author: "Genesis 1:1", work: "King James Bible" },
  { text: "Whether I shall turn out to be the hero of my own life, or whether that station will be held by anybody else, these pages must show.", author: "Charles Dickens", work: "David Copperfield" },
  { text: "I am an invisible man.", author: "Ralph Ellison", work: "Invisible Man" },
  { text: "If one cannot enjoy reading a book over and over again, there is no use in reading it at all.", author: "Oscar Wilde", work: undefined },
];

export default function Epigraph() {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  return (
    <figure className="mx-auto max-w-lg">
      <blockquote className="font-serif text-sm italic text-[#A89B8C]">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <figcaption className="mt-1 text-xs text-[#A89B8C]">
        &mdash; {quote.author}{quote.work ? `, ${quote.work}` : ""}
      </figcaption>
    </figure>
  );
}
