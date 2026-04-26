import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const galleryItems = [
  { title: "Annual Entrepreneurship Summit 2024", color: "bg-blue-100" },
  { title: "Startup Pitch Competition", color: "bg-indigo-100" },
  { title: "GST Workshop — Mumbai", color: "bg-green-100" },
  { title: "Women Entrepreneurs Meet", color: "bg-pink-100" },
  { title: "Investor Connect Event", color: "bg-yellow-100" },
  { title: "Certificate Distribution Ceremony", color: "bg-purple-100" },
  { title: "Digital Marketing Bootcamp", color: "bg-cyan-100" },
  { title: "Leadership & Team Building", color: "bg-orange-100" },
  { title: "Student Projects Showcase", color: "bg-rose-100" },
];

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                Gallery
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Explore our events, workshops, and the vibrant NEDC community.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl ${item.color} aspect-[4/3] cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                    <h3 className="text-lg font-bold">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
