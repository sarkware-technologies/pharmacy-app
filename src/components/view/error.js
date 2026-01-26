import { AppToastService } from '../AppToast';

export const ErrorMessage = (error) => {
  const statusCode = error?.response?.status;

  if ([500, 502, 504].includes(statusCode)) {
    AppToastService.show(`Server temporarily unavailable (Error ${statusCode}). Please try again later.`, "error", "Server Error");
  } else if (error?.message === 'Network Error') {
    AppToastService.show("Please check your internet connection and try again.", "error", "Network Error");
  } else if (statusCode === 404) {
    AppToastService.show("Requested data not found. Please try again.", "error", "Not Found");
  } else {
    AppToastService.show(error?.message, "error", "Error");
  }
};
