type ResData<T> = {
  status: number;
  data: T;
  success: true;
};

type ResError = {
  status: number;
  errorId: number;
  success: false;
  message: string;
};

type ResApi<T> = ResData<T> | ResError;

const dataWrapper = <T>(data: T, status = 200): ResData<T> => ({
  status,
  data,
  success: true,
});

let ERROR_IDS = {
  BACKEND_ERROR: 0,

  METHOD_NOT_ALLOWED: 100,
  BAD_REQUEST: 101,
  NOT_FOUND: 102,
} as const;

type ErrorKind = keyof typeof ERROR_IDS;
type ErrorId = typeof ERROR_IDS[ErrorKind];

const values = Object.values(ERROR_IDS);
const valueSet = new Set(values);

if (values.length !== valueSet.size) {
  /// Should never happen
  throw new Error("ERROR_IDS contains duplicates");
}

const ERROR_IDS_REV: { [key: string]: ErrorKind } = Object.fromEntries(
  Object.entries(ERROR_IDS).map(
    ([k, v]) => [v.toString(), k] as [string, ErrorKind]
  )
);

const errorWrapper =
  process.env.NODE_ENV === "production"
    ? (errorId: number, _: string, status: number = 400): ResError => {
        console.error(`[${status}][${ERROR_IDS_REV[errorId]}]: ` + _);
        return {
          status,
          errorId,
          success: false,
        } as ResError;
      }
    : (errorId: number, message: string, status: number = 400): ResError => {
        console.error(`[${status}][${errorId}]: ` + message);
        return {
          status,
          errorId,
          success: false,
          message,
        };
      };

export type { ResApi };
export { ERROR_IDS, errorWrapper, dataWrapper };
