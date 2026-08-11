"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAddnewProductMutation } from "@/redux/fetchApi/productApi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  ArrowLeft,
  Upload,
  X,
  Package,
  IndianRupee,
  Layers,
  FileText,
  Sliders,
  Plus,
  CheckCircle2,
} from "lucide-react";

function AddProduct() {
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [addnewProduct, { isLoading: isAddingProduct }] = useAddnewProductMutation();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    categories: "",
    stock: "",
    specifications: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/");
    }
  }, [currentUser, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create object URLs for image preview
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.description || !formData.stock) {
      toast.error("Please fill in all required fields (Title, Price, Description, Stock)");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("title", formData.title.trim());
    formPayload.append("price", formData.price);
    formPayload.append("description", formData.description.trim());
    formPayload.append("stock", formData.stock);

    const categoriesList = formData.categories
      ? formData.categories.split(",").map((cat) => cat.trim()).filter(Boolean)
      : ["General"];

    const specificationsList = formData.specifications
      ? formData.specifications.split(",").map((spec) => spec.trim()).filter(Boolean)
      : [];

    categoriesList.forEach((cat) => formPayload.append("categories", cat));

    specificationsList.forEach((spec) => {
      if (spec) {
        const [key, value] = spec.split(":").map((s) => s.trim());
        if (key && value) {
          formPayload.append(`specifications[${key}]`, value);
        }
      }
    });

    selectedFiles.forEach((image) => {
      formPayload.append("images", image);
    });

    try {
      await addnewProduct({ formdata: formPayload }).unwrap();
      toast.success("Product created successfully!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to add product");
    }
  };

  const parsedCategories = formData.categories
    ? formData.categories.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/dashboard")}
              className="mb-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 p-0 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create New Product
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add new item details, inventory stock, and high quality showcase media
            </p>
          </div>
          <Badge className="w-fit bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 text-xs">
            Admin Inventory Portal
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Details Card */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> General Information
              </CardTitle>
              <CardDescription>Enter product title, pricing, and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium text-sm">
                  Product Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  value={formData.title}
                  onChange={handleChange}
                  className="h-11"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-medium text-sm flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Price (₹) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="2999"
                    value={formData.price}
                    onChange={handleChange}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="font-medium text-sm flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" /> Initial Stock Quantity <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.stock}
                    onChange={handleChange}
                    className="h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium text-sm flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Description <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide detailed description, key features, and highlights..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorization & Specs Card */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" /> Organization & Specifications
              </CardTitle>
              <CardDescription>Set categories and key-value specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categories" className="font-medium text-sm">
                  Categories (Comma-separated)
                </Label>
                <Input
                  id="categories"
                  name="categories"
                  placeholder="Electronics, Audio, Headphones"
                  value={formData.categories}
                  onChange={handleChange}
                  className="h-11"
                />
                {parsedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {parsedCategories.map((cat, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications" className="font-medium text-sm">
                  Technical Specifications (format: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Key: Value, Key: Value</code>)
                </Label>
                <Textarea
                  id="specifications"
                  name="specifications"
                  placeholder="Brand: Sony, Color: Black, Battery: 30 hours, Bluetooth: 5.2"
                  value={formData.specifications}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Image Upload Card */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-500" /> Product Showcase Images
              </CardTitle>
              <CardDescription>Upload high resolution media files for product gallery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Drop Area */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/20 transition-all cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-sm">Click or Drag & Drop Product Images</div>
                  <p className="text-xs text-slate-400">Supports PNG, JPG, WEBP formats (Upload multiple files)</p>
                </div>
              </div>

              {/* Image Previews Grid */}
              {filePreviews.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                    Selected Images ({filePreviews.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square bg-slate-100 dark:bg-slate-800">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/dashboard")}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAddingProduct}
              className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md flex items-center gap-2"
            >
              {isAddingProduct ? (
                <>Adding Product...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save & Publish Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
