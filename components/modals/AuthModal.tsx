"use client";
import React, { useTransition, useState, useEffect } from "react";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Heading from "../Heading";
import Input from "../inputs/Input";
import Button from "../Button";
import Modal from "./Modal";
import SpinnerMini from "../Loader";
import { registerUser } from "@/services/auth";

const AuthModal = ({
  name,
  onCloseModal,
}: {
  name?: string;
  onCloseModal?: () => void;
}) => {
  const tAuth = useTranslations("Auth");
  const tMenu = useTranslations("Menu");

  const [isLoading, startTransition] = useTransition();
  const [mode, setMode] = useState<"login" | "signup">(
    name === "Sign up" ? "signup" : "login",
  );
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    setFocus,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });
  const router = useRouter();
  const isLoginModal = mode === "login";

  const windowTitle = isLoginModal ? tMenu("logIn") : tMenu("signUp");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoginModal) {
        setFocus("email");
      } else {
        setFocus("name");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoginModal, setFocus]);

  const onToggle = () => {
    setMode(isLoginModal ? "signup" : "login");
    reset();
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const { email, password, name } = data;

    startTransition(async () => {
      try {
        if (isLoginModal) {
          const callback = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (callback?.error) {
            throw new Error(callback.error);
          }
          if (callback?.ok) {
            toast.success(tAuth("loggedIn"));
            onCloseModal?.();
            router.refresh();
          }
        } else {
          await registerUser({ email, password, name });
          setMode("login");
          toast.success(tAuth("registered"));
          reset();
        }
      } catch (error: any) {
        toast.error(error.message);
        if (isLoginModal) {
          reset();
          setError("email", {});
          setError("password", {});
          setTimeout(() => {
            setFocus("email");
          }, 100);
        }
      }
    });
  };

  return (
    <div className="h-full w-full">
      <Modal.WindowHeader title={windowTitle} />

      <form
        className="flex flex-col gap-5 p-6 pb-0 w-full h-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Heading
          title={!isLoginModal ? tAuth("welcomeTo") : tAuth("welcomeBack")}
          subtitle={
            !isLoginModal ? tAuth("createAccount") : tAuth("loginToAccount")
          }
        />

        {!isLoginModal && (
          <Input
            id="name"
            label={tAuth("name")}
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            watch={watch}
          />
        )}

        <Input
          id="email"
          label={tAuth("email")}
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          watch={watch}
        />

        <Input
          id="password"
          label={tAuth("password")}
          type="password"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          watch={watch}
        />

        <Button
          type="submit"
          className="flex items-center justify-center h-[42px]"
        >
          {isLoading ? <SpinnerMini className="w-5 h-5" /> : tAuth("continue")}
        </Button>
      </form>
      <div className="flex flex-col gap-4 mt-3 p-6 pt-0">
        <hr />
        <Button
          outline
          onClick={() => signIn("google")}
          className="flex flex-row justify-center gap-2 items-center px-3 py-2"
        >
          <FcGoogle className="w-6 h-6" />
          <span className="text-[14px]">{tAuth("continueWithGoogle")}</span>
        </Button>
        <Button
          outline
          onClick={() => signIn("github")}
          className="flex flex-row justify-center gap-2 items-center px-3 py-2"
        >
          <AiFillGithub className="w-6 h-6" />
          <span className="text-[14px]">{tAuth("continueWithGithub")}</span>
        </Button>
        <div
          className="
            text-neutral-500 
          text-center 
          mt-2 
          font-light
        "
        >
          <div className="text-[15px]">
            <small className="text-[15px]">
              {!isLoginModal ? tAuth("alreadyHaveAccount") : tAuth("firstTime")}
            </small>
            <button
              type="button"
              onClick={onToggle}
              className="
              text-neutral-800
              cursor-pointer 
              hover:underline
              ml-1
              font-medium
              "
            >
              {!isLoginModal ? tMenu("logIn") : tAuth("createAnAccount")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
