# ArtVaani: Weaving Stories, Selling Art

ArtVaani is a modern e-commerce platform designed to empower artisans by connecting their crafts to a global audience. It leverages the power of Generative AI to help artisans tell the story behind their work, creating a richer, more engaging experience for buyers.

## Tech Stack

This project is built with a modern, server-centric, and AI-first technology stack:

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (for product, user, and order data)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (supporting email/password, Google, and phone authentication)
- **Generative AI**: [Genkit (by Firebase)](https://firebase.google.com/docs/genkit) using Google's Gemini family of models for:
  - Product content generation (title, story, price, tags)
  - Speech-to-text transcription
  - Cultural insights generation
  - Identity verification assistance

## Core Functionality

ArtVaani serves two primary user roles: the **Artisan** (seller) and the **Customer** (buyer).

### For Artisans: The Seller Experience

The platform is designed to make it incredibly simple for artisans, regardless of their technical background, to list products and share their heritage.

1.  **Simple Onboarding**: Artisans can sign up using their email, Google account, or phone number. A simple profile setup captures their name and city.

2.  **AI-Powered Product Listing**: This is the core feature for artisans. The flow is designed to be completed in a single, intuitive process:
    - **Upload**: The artisan uploads a photo of their product.
    - **Describe**: They provide a brief description, either by typing or by using their voice. The voice recording is automatically transcribed into text using AI.
    - **AI Analysis**: Upon submission, a Genkit flow analyzes the image and description to generate:
      - A catchy **Title**.
      - A compelling **Story** that highlights the craft's cultural significance.
      - A suggested **Price** based on the perceived materials and complexity.
      - A list of relevant **Tags** for discoverability.
    - **Review & Publish**: The artisan is taken to a review screen where they can edit the AI-generated content. They can save it as a draft or publish it directly to the marketplace.

3.  **Artisan Dashboard**: A dedicated dashboard where artisans can:
    - View key metrics (sales, product counts).
    - See a list of all their products (both draft and published).
    - Edit existing product details.
    - Manage their profile.

4.  **Identity Verification**: To build trust on the platform, artisans can complete a one-time verification process. The AI-assisted flow uses a live photo and GPS location to confirm the artisan's identity against their profile details.

### For Customers: The Buyer Experience

Customers get a seamless shopping experience enriched with cultural context.

1.  **Product Discovery**:
    - The **Home Page** features a hero section and a curated list of featured products.
    - The **Products Page** displays the entire collection of published crafts in a grid layout.

2.  **Rich Product Details**: Each product page showcases:
    - High-quality product images.
    - The AI-crafted story, providing a narrative that connects the buyer to the craft's origins.
    - Clear pricing and artisan details (name, city, and verification status).

3.  **Shopping Cart**: A standard, easy-to-use shopping cart for adding products, adjusting quantities, and proceeding to checkout.

4.  **Cultural Insights Explorer**: An AI-powered page where anyone can enter the name of a craft (e.g., "Madhubani Painting") and receive a detailed write-up about its history, techniques, and cultural importance.

5.  **Multilingual Support**: The user interface supports multiple languages, making the platform accessible to a broader audience.

---

