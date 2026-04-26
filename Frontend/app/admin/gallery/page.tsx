"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { Plus, Trash2, Image, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AdminGalleryPage() {
  useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", imageUrl: "", description: "" });

  const fetchItems = () => {
    fetch(`${API_BASE}/gallery`)
      .then((r) => r.json())
      .then((d) => setItems(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_BASE}/gallery`, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
        credentials: "include",
      body: JSON.stringify(form),
    });
    setForm({ title: "", imageUrl: "", description: "" });
    setShowForm(false);
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;
    await fetch(`${API_BASE}/gallery/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gallery Manager</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </div>

      {showForm && (
        <Card className="p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Add Gallery Item</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required placeholder="https://..." />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3">
              <Button type="submit">Add to Gallery</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title || ""} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-gray-100">
                  <Image className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm">{item.title || "Untitled"}</h3>
                {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Image className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No gallery items</h3>
          <p className="text-gray-500">Add images to your gallery.</p>
        </Card>
      )}
    </div>
  );
}
