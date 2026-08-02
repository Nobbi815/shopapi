import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

const createProductSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().trim().optional(),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative().default(0),
    image: z.string().trim().url().optional(),
    categoryId: z.number().int().positive().optional(),
    categoryName: z.string().trim().min(1).optional(),
  })
  .refine((value) => value.categoryId !== undefined || value.categoryName !== undefined, {
    message: "categoryId or categoryName is required",
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;

const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    image: z.string().trim().url().optional(),
    categoryId: z.number().int().positive().optional(),
    categoryName: z.string().trim().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update a product",
  });

function categoryRelation(data: Partial<CreateProductInput>) {
  if (data.categoryId) {
    return { connect: { id: data.categoryId } };
  }

  if (data.categoryName) {
    return {
      connectOrCreate: {
        where: { name: data.categoryName },
        create: { name: data.categoryName },
      },
    };
  }

  return undefined;
}

export async function listProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    return res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid product id" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    return res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        image: data.image,
        category: categoryRelation(data)!,
      },
      include: { category: true },
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid product id" });
    }

    const data = updateProductSchema.parse(req.body);
    const updateData: Record<string, unknown> = {
      ...(data.name ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.stock !== undefined ? { stock: data.stock } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
    };

    if (data.categoryId || data.categoryName) {
      updateData.category = categoryRelation(data);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid product id" });
    }

    await prisma.product.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
