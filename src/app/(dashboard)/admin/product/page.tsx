"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAddnewProductMutation } from "@/redux/fetchApi/productApi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

function AddProduct() {
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [addnewProduct, { isLoading: isAddingProduct }] =
    useAddnewProductMutation();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    categories: "",
    stock: "",
    specifications: "",
    images: [] as File[],
  });

  useEffect(() => {
    if (currentUser?.role !== "admin") {
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
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formPayload = new FormData();

    formPayload.append("title", formData.title);
    formPayload.append("price", formData.price);
    formPayload.append("description", formData.description);
    formPayload.append("stock", formData.stock);

    
    const categories = formData.categories
      ? formData.categories.split(",").map((cat) => cat.trim())
      : [];
    const specifications = formData.specifications
      ? formData.specifications.split(",").map((spec) => spec.trim())
      : [];
    categories.forEach((cat) => formPayload.append("categories", cat));

    specifications.forEach((spec) => {
      if (spec) {
        const [key, value] = spec.split(":").map((s) => s.trim());
        if (key && value) {
          formPayload.append(`specifications[${key}]`, value);
        }
      }
    });

    formData.images.forEach((image) => {
      formPayload.append("images", image);
    });

    try {
      const response = await addnewProduct({ formdata: formPayload }).unwrap();
      console.log(response);
      toast.success("Product added successfully");
      router.push("/products");
    } catch (err) {
      toast.error("Failed to add product");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" placeholder="Title" onChange={handleChange} />
        <Input
          name="price"
          type="number"
          placeholder="Price"
          onChange={handleChange}
        />
        <Textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />
        <Input
          name="categories"
          placeholder="Categories (comma-separated)"
          onChange={handleChange}
        />
        <Input
          name="stock"
          type="number"
          placeholder="Stock"
          onChange={handleChange}
        />
        <Textarea
          name="specifications"
          placeholder="Specifications (key: value, comma-separated)"
          onChange={handleChange}
        />
        <Input type="file" multiple onChange={handleImageChange} />
        <Button type="submit" disabled={isAddingProduct}>
          {isAddingProduct ? "Adding..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
}

export default AddProduct;
