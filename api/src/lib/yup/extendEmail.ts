import { emailScheme } from "@packages/shared";
import prisma from "../prisma";

/**
 * フロント側と共通のEメールアドレスチェック用スキーマに、
 * DBアクセスしてユニークかどうか確認するロジックを加える
 */
const extendEmailScheme = emailScheme
  .clone()
  .test(
    "is-unique",
    "このメールアドレスは既に使用されています",
    async (value) => {
      const sameEmail = await prisma.user.findUnique({
        where: {
          email: value,
        },
      });

      return !sameEmail;
    }
  );

export default extendEmailScheme;
