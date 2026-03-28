import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadTheme } from "../features/themeSlice";
import { Loader2Icon } from "lucide-react";
import { useAuth, useUser } from "@clerk/react";
import { CreateOrganization, useOrganization } from "@clerk/react";
import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../configs/api";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const { workspaces } = useSelector((state) => state.workspace);
  const dispatch = useDispatch();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const location = useLocation();

  useEffect(() => {
    dispatch(loadTheme());
  }, [dispatch]);

  useEffect(() => {
    // Sirf user load hone ka wait karo, org ka nahi
    if (!isLoaded || !user) return;

    const syncWorkspace = async () => {
      setIsFetching(true);

      const result = await dispatch(fetchWorkspaces({ getToken }));
      const fetched = result.payload;

      if (Array.isArray(fetched) && fetched.length === 0 && organization?.id) {
        try {
          const token = await getToken();
          await api.post(
            "/api/workspaces",
            { name: organization.name },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          await dispatch(fetchWorkspaces({ getToken }));
        } catch (error) {
          console.log("createWorkspace error:", error);
        }
      }

      setIsFetching(false);
    };

    syncWorkspace();
  }, [dispatch, user?.id, isLoaded, organization?.id]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
        <Loader2Icon className="size-7 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
        <Loader2Icon className="size-7 animate-spin" />
      </div>
    );
  }

  if (!isFetching && workspaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <CreateOrganization skipInvitationScreen={true} />
      </div>
    );
  }

  if (workspaces.length > 0 && location.pathname === "/create-organization") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col h-screen">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
