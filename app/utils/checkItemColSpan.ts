/**
 * Checks the total quantity of items in grid layout and returns proper
 * 'col-span-*' property value.
 *
 * @param index - index of current item in grid
 * @param totalItems - total number of items in grid
 * @param rowItems - number of items in the row. Function works only for
 * rowItems = 3
 */
export const checkItemColSpan = (
  index: number,
  totalItems: number,
  rowItems = 3,
): string => {
  // Calculate how many items are in the last row
  const lastRowCount =
    totalItems % rowItems === 0 ? rowItems : totalItems % rowItems;

  // Calculate the starting index of the last row
  const firstIndexOfLastRow = totalItems - lastRowCount;

  if (index < firstIndexOfLastRow) {
    return "col-span-4";
  }

  // One element in a row
  if (lastRowCount === 1) {
    return "col-span-12";
  }
  // Two elements in a row
  if (lastRowCount === 2) {
    return "col-span-6";
  }

  return "col-span-4";
};
