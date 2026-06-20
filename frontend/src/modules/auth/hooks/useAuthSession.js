import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as authApi from "../api/authApi";
import { authStart, authSuccess, clearAuth } from "../redux/authSlice";
import { setAccessToken, clearAccessToken } from "../../../services/apiClient";

const useAuthSession = () => {
  const dispatch = useDispatch();
  const isBootstrapped = useSelector((state) => state.auth.isBootstrapped);

  useEffect(() => {
    if (isBootstrapped) return;

    let isCancelled = false;

    const bootstrapSession = async () => {
      dispatch(authStart());

      try {
        const data = await authApi.refreshToken();

        setAccessToken(data.accessToken);

        const user = data.user;

        if (isCancelled) return;

        dispatch(
          authSuccess({
            user,
            accessToken: data.accessToken,
          }),
        );
      } catch {
        clearAccessToken();

        if (!isCancelled) {
          dispatch(clearAuth());
        }
      }
    };

    bootstrapSession();

    return () => {
      isCancelled = true;
    };
  }, [dispatch, isBootstrapped]);

  return {
    isBootstrapped,
  };
};

export default useAuthSession;
