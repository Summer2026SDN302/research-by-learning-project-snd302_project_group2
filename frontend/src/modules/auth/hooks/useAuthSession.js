import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as authApi from "../api/authApi";
import { authStart, authSuccess, clearAuth } from "../redux/authSlice";
import { setAccessToken, clearAccessToken } from "../../../services/appClient";

const useAuthSession = () => {
  const dispatch = useDispatch();
  const isBootstrapped = useSelector((state) => state.auth.isBootstrapped);

  useEffect(() => {
    if (isBootstrapped) return;

    const bootstrapSession = async () => {
      dispatch(authStart());

      try {
        const user = await authApi.getProfile();

        dispatch(
          authSuccess({
            user,
            accessToken: null,
          }),
        );

        return;
      } catch {
        // Access token có thể hết hạn, thử refresh bằng httpOnly refresh cookie.
      }

      try {
        const data = await authApi.refreshToken();

        setAccessToken(data.accessToken);

        dispatch(
          authSuccess({
            user: data.user,
            accessToken: data.accessToken,
          }),
        );
      } catch {
        clearAccessToken();
        dispatch(clearAuth());
      }
    };

    bootstrapSession();
  }, [dispatch, isBootstrapped]);

  return {
    isBootstrapped,
  };
};

export default useAuthSession;