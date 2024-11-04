import { Handler } from "aws-lambda";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;
const stockTableName = process.env.STOCK_TABLE_NAME as string;

export const createProduct: Handler = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const productId = randomUUID();
    const poster =
      body?.poster ??
      "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg";

    const createProductCommand = new PutItemCommand({
      TableName: productsTableName,
      Item: {
        id: { S: productId },
        title: { S: body.title },
        description: { S: body.description || "" },
        price: { N: body.price.toString() },
        poster: { S: poster },
      },
    });

    await dynamoDB.send(createProductCommand);

    const createStockCommand = new PutItemCommand({
      TableName: stockTableName,
      Item: {
        product_id: { S: productId },
        count: { N: body.count.toString() },
      },
    });

    await dynamoDB.send(createStockCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Product created successfully" }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating product",
        error: error.message,
      }),
    };
  }
};

export const getProductsList: Handler = async (event, context) => {
  try {
    const productsCommand = new ScanCommand({ TableName: productsTableName });
    const productsResult = await dynamoDB.send(productsCommand);

    const stockCommand = new ScanCommand({ TableName: stockTableName });
    const stockResult = await dynamoDB.send(stockCommand);

    const products = productsResult.Items?.map((product) => {
      const stock = stockResult.Items?.find(
        (s) => s.product_id.S === product.id.S
      );
      return {
        id: product.id.S,
        title: product.title.S,
        description: product.description.S,
        price: parseInt(product.price.N as any),
        count: stock ? parseInt(stock.count.N as any) : 0,
        poster:
          product?.poster?.S ??
          "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg",
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error retrieving products",
        error: error.message,
      }),
    };
  }
};

export const getProductById: Handler = async (event) => {
  const productId = event.pathParameters?.productId;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Product ID is required" }),
    };
  }

  try {
    const getProductCommand = new GetItemCommand({
      TableName: productsTableName,
      Key: {
        id: { S: productId },
      },
    });

    const productResult: any = await dynamoDB.send(getProductCommand);

    if (!productResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const getStockCommand = new GetItemCommand({
      TableName: stockTableName,
      Key: {
        product_id: { S: productId },
      },
    });

    const stockResult: any = await dynamoDB.send(getStockCommand);
    const count = stockResult.Item ? parseInt(stockResult.Item.count.N) : 0;

    const product = {
      id: productResult.Item.id.S,
      title: productResult.Item.title.S,
      description: productResult.Item.description.S,
      price: parseInt(productResult.Item.price.N),
      count,
      poster:
        productResult?.poster ??
        "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg",
    };

    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error retrieving product",
        error: error.message,
      }),
    };
  }
};
