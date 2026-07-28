import FeedbackForm from "./feedback-form";
import FeedbackOverview from "./feedback-overview";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 space-y-10">
      <h1 className="text-2xl font-bold text-center">
        Product Feedback System
      </h1>

      <section>
        <FeedbackForm />
      </section>

      <section>
        <FeedbackOverview />
      </section>
    </main>
  );
}
