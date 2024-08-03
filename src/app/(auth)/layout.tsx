import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //check auth
  //nếu vào trang login lại thì chạy cái này
  // khi đã đăng nhập rồi (check qua cái validateRequest) => tự động đá sang trang home
  const { user } = await validateRequest();
  if (user) redirect("/");
  return <>{children}</>;
}
