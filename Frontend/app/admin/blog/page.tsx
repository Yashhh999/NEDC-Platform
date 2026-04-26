"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { Plus, Trash2, Edit, Eye, EyeOff, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AdminBlogPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    authorName: "",
    published: false,
  });

  const fetchPosts = () => {
    if (!token) return;
    fetch(`${API_BASE}/blog/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setPosts(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `${API_BASE}/blog/${editingId}` : `${API_BASE}/blog`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setForm({ title: "", slug: "", content: "", excerpt: "", authorName: "", published: false });
    setEditingId(null);
    setShowForm(false);
    fetchPosts();
  };

  const editPost = (post: any) => {
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      authorName: post.authorName || "",
      published: post.published,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`${API_BASE}/blog/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePublish = async (post: any) => {
    await fetch(`${API_BASE}/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !post.published }),
    });
    fetchPosts();
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog CMS</h1>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: "", slug: "", content: "", excerpt: "", authorName: "", published: false }); }}>
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Editor form */}
      {showForm && (
        <Card className="p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Post" : "New Post"}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) });
                }}
                required
              />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <Input label="Author Name" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
            <Input label="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <textarea
                className="flex min-h-[200px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-y"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your blog post content..."
                required
              />
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Publish immediately</span>
            </label>
            <div className="flex gap-3">
              <Button type="submit">{editingId ? "Update Post" : "Create Post"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Posts table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-5 animate-pulse rounded bg-gray-200 w-3/4" /></td></tr>
                  ))
                : posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{post.title}</td>
                      <td className="px-6 py-4 text-gray-500">{post.authorName || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          post.published ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => togglePublish(post)} title={post.published ? "Unpublish" : "Publish"}>
                            {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => editPost(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
