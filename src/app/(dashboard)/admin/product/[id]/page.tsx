"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useUpdateProductMutation,
  useGetSingleProductQuery,
} from "@/redux/fetchApi/productApi";
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
  CheckCircle2,
  Image as ImageIcon,
  Edit,
} from "lucide-react";

type FormDataType = {
  title: string;
  price: string;
  description: string;
  categories: string;
  stock: string;
  specifications: string;
};

function UpdateProduct() {
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { id } = useParams();

  const {
    data: productData,
    isLoading: isFetchingProduct,
    isError: isFetchError,
  } = useGetSingleProductQuery(id as string);

  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    price: "",
    description: "",
    categories: "",
    stock: "",
    specifications: "",
  });

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/");
      return;
    }

    if (productData?.product) {
      let specificationsString = "";
      if (
        typeof productData.product.specifications === "object" &&
        productData.product.specifications !== null
      ) {
        specificationsString = Object.entries(productData.product.specifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }

      setFormData({
        title: productData.product.title || "",
        price: productData.product.price?.toString() || "",
        description: productData.product.description || "",
        categories: productData.product.categories?.join(", ") || "",
        stock: productData.product.stock?.toString() || "",
        specifications: specificationsString,
      });
    }
  }, [productData, currentUser, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const newFiles = [...newImageFiles, ...files];
    setNewImageFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formPayload = new FormData();
    formPayload.append("title", formData.title.trim());
    formPayload.append("price", formData.price);
    formPayload.append("description", formData.description.trim());
    formPayload.append("stock", formData.stock);

    const categoriesList = formData.categories
      ? formData.categories.split(",").map((cat) => cat.trim()).filter(Boolean)
      : [];

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

    newImageFiles.forEach((image) => {
      formPayload.append("images", image);
    });

    try {
      await updateProduct({
        formdata: formPayload,
        id,
      }).unwrap();
      toast.success("Product updated successfully!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update product");
    }
  };

  if (isFetchingProduct) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center text-slate-500">Loading product details...</div>
      </div>
    );
  }

  if (isFetchError || !productData?.product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="text-rose-500 font-bold text-lg mb-2">Product Not Found</div>
        <Button onClick={() => router.push("/admin/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Edit className="w-7 h-7 text-blue-600" /> Edit Product
            </h1>
            <p className="font-mono text-xs text-slate-400 mt-1">ID: {id}</p>
          </div>
          <Badge className="w-fit bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1 text-xs">
            Product Modification
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Details Card */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> General Details
              </CardTitle>
              <CardDescription>Update title, pricing, and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium text-sm">
                  Product Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
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
                    value={formData.price}
                    onChange={handleChange}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="font-medium text-sm flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" /> Stock Quantity <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
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
              <CardDescription>Update product categories and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categories" className="font-medium text-sm">
                  Categories (Comma-separated)
                </Label>
                <Input
                  id="categories"
                  name="categories"
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
                  Specifications (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Key: Value, Key: Value</code>)
                </Label>
                <Textarea
                  id="specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Management Card */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" /> Image Gallery & Media Updates
              </CardTitle>
              <CardDescription>Review current product images and optionally replace or upload new ones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Images */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">Current Images</h4>
                {productData.product.images?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {productData.product.images.map((img: any, idx: number) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square bg-slate-100 dark:bg-slate-800">
                        <img src={img.url} alt={`Product ${idx + 1}`} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No images currently uploaded.</p>
                )}
              </div>

              {/* Upload New Images */}
              <div className="space-y-3 pt-2 border-t">
                <h4 className="text-xs font-semibold uppercase text-slate-400">
                  Upload Replacement / New Images
                </h4>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/20 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="font-semibold text-sm">Click to Select New Images</div>
                    <p className="text-xs text-slate-400">Uploading new files will update the product gallery</p>
                  </div>
                </div>

                {newImagePreviews.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-slate-400 mb-2">
                      New Images Selected ({newImagePreviews.length})
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square bg-slate-100 dark:bg-slate-800">
                          <img src={preview} alt={`New Preview ${index + 1}`} className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              disabled={isUpdatingProduct}
              className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md flex items-center gap-2"
            >
              {isUpdatingProduct ? (
                <>Updating Product...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Product Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProduct;
