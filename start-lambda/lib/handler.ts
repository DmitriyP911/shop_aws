const mockedProducts = [
  {
    description: "Short Product Description1",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    price: 24,
    title: "Laptop HP",
    poster:
      "https://content1.rozetka.com.ua/goods/images/big_tile/375424610.jpg",
  },
  {
    description: "Short Product Description7",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    price: 15,
    title: "Samsung TV",
    poster:
      "https://content.rozetka.com.ua/goods/images/big_tile/412242373.jpg",
  },
  {
    description: "Short Product Description2",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    price: 23,
    title: "Power station",
    poster:
      "https://content1.rozetka.com.ua/goods/images/big_tile/471357590.jpg",
  },
  {
    description: "Short Product Description4",
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    price: 15,
    title: "Samsung smartphone",
    poster:
      "https://content.rozetka.com.ua/goods/images/big_tile/398085826.jpg",
  },
  {
    description: "Short Product Description1",
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    price: 23,
    title: "Airpods",
    poster:
      "https://content.rozetka.com.ua/goods/images/big_tile/285470239.jpg",
  },
  {
    description: "Short Product Description7",
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    price: 15,
    title: "Canon",
    poster:
      "https://content.rozetka.com.ua/goods/images/big_tile/304428963.jpg",
  },
];

export async function getProducts() {
  return {
    products: mockedProducts,
  };
}

export async function getProductById(event: {
  pathParameters: { id: string };
}) {
  if (event?.pathParameters?.id) {
    return {
      data: mockedProducts.find((item) => item.id === event.pathParameters.id),
    };
  }
  return {
    event,
  };
}
