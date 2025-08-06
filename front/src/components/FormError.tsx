import { FC } from "react";
import { Field } from "@chakra-ui/react";

type Props = {
  messages: string;
};

const FormError: FC<Props> = ({ messages }) => {
  return (
    <>
      {messages.split("\n").map((message, idx) => (
        <Field.ErrorText key={idx}>{message}</Field.ErrorText>
      ))}
    </>
  );
};

export default FormError;
