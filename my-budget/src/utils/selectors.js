import { useSelector } from "react-redux";

export const useIncomeItems = () =>
  useSelector((state) => state.income?.items ?? []);

export const useExpenseItems = () =>
  useSelector((state) => state.expense?.items ?? []);
