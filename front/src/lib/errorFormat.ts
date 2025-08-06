import { ValidationError } from "yup";

/**
 * バリデーションエラー整形用
 */

export type eachError = {
  name: string;
  messages: string;
};

export type allError = eachError[];

export const errorFormat = (fieldErrors: ValidationError[]) => {
  const err: allError = [];
  for (let i = 0; i < fieldErrors.length; i++) {
    const errObj = err.find((er) => er.name === fieldErrors[i]["path"]);

    if (errObj) {
      errObj.messages = errObj.messages.concat("\n", fieldErrors[i]["message"]);
      // console.log("errObj.messages: " + errObj.messages);
    } else {
      err.push({
        name: fieldErrors[i]["path"],
        messages: fieldErrors[i]["message"],
      } as eachError);
    }
  }

  return err;
};
