import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";

export async function PATCH(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      // Expect a single address object
      const { street, city, state, zipCode, country, isDefault } = await request.json();
      
      console.log(street, city, state, zipCode, country, isDefault);
        
      if (!street || !city || !state || !zipCode || !country) {
        return NextResponse.json(
          { error: "Please fill in all the fields" },
          { status: 400 }
        );
      }
  
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      // Create the new address
      const address = {
        street,
        city,
        state,
        zipCode,
        country,
        isDefault,
      };
  
      // If isDefault is true, set all other addresses to non-default
      if (isDefault) {
        user.addresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
  
      // Add the new address
      user.addresses.push(address);
      await user.save();
  
      return NextResponse.json({ user }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
