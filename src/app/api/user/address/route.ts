import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";
import connectDb from "@/config/connectDb";

// Utility to validate address fields
const validateAddressFields = (fields: any) => {
  const { street, city, state, zipCode, country } = fields;
  if (!street || !city || !state || !zipCode || !country) {
    return "Please fill in all required address fields";
  }
  return null;
};

// Middleware to check session and user
const authenticateUser = async (request: NextRequest) => {
  await connectDb();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return { session, user };
};

// POST: Add a new address
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { street, city, state, zipCode, country, isDefault } =
      await request.json();
    const validationError = validateAddressFields({
      street,
      city,
      state,
      zipCode,
      country,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const newAddress = {
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: !!isDefault, // Ensure boolean
    };

    if (isDefault) {
      user.addresses.forEach((addr: any) => (addr.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json({ user }, { status: 201 }); // 201 for created resource
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing address
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id, street, city, state, zipCode, country, isDefault } =
      await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    const validationError = validateAddressFields({
      street,
      city,
      state,
      zipCode,
      country,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const address = user.addresses.find(
      (addr: any) => addr._id.toString() === id
    );
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Update address fields
    address.street = street;
    address.city = city;
    address.state = state;
    address.zipCode = zipCode;
    address.country = country;
    address.isDefault = !!isDefault;

    if (isDefault) {
      user.addresses.forEach((addr: any) => {
        if (addr._id.toString() !== id) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an address
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== id
    );
    if (user.addresses.length === initialLength) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await user.save();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
