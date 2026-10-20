import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  },
  {
    // 서비스워커는 번들 밖의 순수 스크립트라 브라우저·워커 전역을 직접 선언한다.
    files: ["public/sw.js"],
    languageOptions: {
      sourceType: "script",
      globals: { self: "readonly", caches: "readonly", fetch: "readonly", URL: "readonly", Response: "readonly" }
    }
  },
  {
    ignores: ["dist/", "node_modules/", "playwright-report/", "coverage/"]
  }
);
