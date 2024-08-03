import ky from "ky";

const kyInstance = ky.create({
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      // đưa cái key kết thúc bằng at ví dụ như createdAt (định dạng là date mà trả ra là string)
      if (key.endsWith("At")) return new Date(value);
      return value;
    }),
});

export default kyInstance;
