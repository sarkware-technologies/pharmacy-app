import Toast from "react-native-toast-message";

export const ErrorMessage = (error) => {
  const statusCode = error?.response?.status;

  if ([500, 502, 504].includes(statusCode)) {
    Toast.show({
      type: 'error',
      text1: 'Server Error',
      text2: `Server temporarily unavailable (Error ${statusCode}). Please try again later.`,
      props: {
    style: {
      zIndex: 9999,
      elevation: 9999
    }
  }
    });
  } else if (error?.message === 'Network Error') {
    Toast.show({
      type: 'error',
      text1: 'Network Error',
      text2: 'Please check your internet connection and try again.',
      props: {
    style: {
      zIndex: 9999,
      elevation: 9999
    }
  }
    });
  } else if (statusCode === 404) {
    Toast.show({
      type: 'error',
      text1: 'Not Found',
      text2: 'Requested data not found. Please try again.',
      props: {
    style: {
      zIndex: 9999,
      elevation: 9999
    }
  }
    });
  } else {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error?.message,
      props: {
    style: {
      zIndex: 9999,
      elevation: 9999
    }
  }
    });
  }
};
