import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth.api.js";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            const accessToken = data?.message?.accessToken;
            const user = data?.message?.user;

            if (!accessToken || !user) return;

            localStorage.setItem("token", accessToken);
            localStorage.setItem("user", JSON.stringify(user));

            setTimeout(() => {
                switch (user.role) {
                    case "ADMIN":
                        navigate("/admin", { replace: true });
                        break;
                    case "MANAGER":
                        navigate("/manager", { replace: true });
                        break;
                    case "MEMBER":
                        navigate("/member", { replace: true });
                        break;
                    default:
                        navigate("/", { replace: true });
                }
            }, 0);
        }


    });
}


export default useLogin;