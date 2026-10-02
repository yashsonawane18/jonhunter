export interface Testimonial {
  id: number;
  content: string;
  author: string;
  role: string;
  avatar: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Leader {
  name: string;
  role: string;
  quote: string;
  image: string;
}
