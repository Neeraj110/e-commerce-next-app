"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useUpdateProductMutation,
  useGetSingleProductQuery,
} from "@/redux/fetchApi/productApi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import Image from "next/image";

type FormDataType = {
  title: string;
  price: string;
  description: string;
  categories: string;
  stock: string;
  specifications: string;
  images: File[];
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

  const [updateProduct, { isLoading: isUpdatingProduct }] =
    useUpdateProductMutation();

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    price: "",
    description: "",
    categories: "",
    stock: "",
    specifications: "",
    images: [],
  });

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/");
      return;
    }

    if (productData?.product) {
      let specificationsString = "";
      if (
        typeof productData.product.specifications === "object" &&
        productData.product.specifications !== null
      ) {
        specificationsString = Object.entries(
          productData.product.specifications
        )
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
        images: [],
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
      const response = await updateProduct({
        formdata: formPayload,
        id,
      }).unwrap();
      console.log(response);
      toast.success("Product updated successfully");
    } catch (err) {
      toast.error("Failed to update product");
      console.error(err);
    }
  };

  if (isFetchingProduct) return <div>Loading product...</div>;
  if (isFetchError) return <div>Error fetching product</div>;
  if (!productData?.product) return <div>Product not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Update Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(
          Object.keys(formData).filter((key) => key !== "images") as Array<
            keyof Omit<FormDataType, "images">
          >
        ).map((key) => (
          <div key={key}>
            <Label htmlFor={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Label>
            {key === "description" ? (
              <Textarea
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                placeholder={`Enter product ${key}`}
                rows={4}
              />
            ) : (
              <Input
                id={key}
                name={key}
                type={key === "price" || key === "stock" ? "number" : "text"}
                value={formData[key] as string}
                onChange={handleChange}
                placeholder={`Enter product ${key} ${key === "specifications" ? "(comma-separated)" : ""
                  }`}
              />
            )}
          </div>
        ))}

        <div>
          <Label>Current Images</Label>
          <div className="flex space-x-2 mt-2">
            {productData.product.images?.map((image: any, index: number) => (
              <span
                key={index}
                className="relative h-20 w-20 overflow-hidden rounded"
              >
                <Image
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="80px"
                />
              </span>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="images">
            Upload New Images (replaces existing images)
          </Label>
          <Input
            id="images"
            type="file"
            multiple
            onChange={handleImageChange}
            className="mt-2"
          />
        </div>

        <Button type="submit" disabled={isUpdatingProduct} className="w-full">
          {isUpdatingProduct ? "Updating..." : "Update Product"}
        </Button>
      </form>
    </div>
  );
}

export default UpdateProduct;
