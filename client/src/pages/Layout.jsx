import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadTheme } from "../features/themeSlice";
import { Loader2Icon } from "lucide-react";
import {
  CreateOrganization,
  useAuth,
  useOrganization,
  useOrganizationList,
  useUser,
} from "@clerk/react";
import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../configs/api";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [workspaceError, setWorkspaceError] = useState(null);
  const [syncAttempt, setSyncAttempt] = useState(0);

  const { workspaces } = useSelector((state) => state.workspace);
  const dispatch = useDispatch();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const {
    isLoaded: areMembershipsLoaded,
    setActive,
    userMemberships,
  } = useOrganizationList({ userMemberships: true });
  const firstOrganizationId = userMemberships.data?.[0]?.organization.id;
  const location = useLocation();

  useEffect(() => {
    dispatch(loadTheme());
  }, [dispatch]);

  useEffect(() => {
    if (
      !isLoaded ||
      !user ||
      !areMembershipsLoaded ||
      organization?.id ||
      !firstOrganizationId
    ) {
      return;
    }

    setActive({ organization: firstOrganizationId }).catch((error) => {
      setWorkspaceError(
        error?.message || "Unable to select your existing organization.",
      );
      setIsFetching(false);
    });
  }, [
    areMembershipsLoaded,
    firstOrganizationId,
    isLoaded,
    organization?.id,
    setActive,
    user?.id,
  ]);

  useEffect(() => {
    if (!isLoaded || !user || !areMembershipsLoaded) return;
    if (!organization?.id && firstOrganizationId) return;

    const syncWorkspace = async () => {
      setIsFetching(true);
      setWorkspaceError(null);

      const result = await dispatch(fetchWorkspaces({ getToken }));
      if (fetchWorkspaces.rejected.match(result)) {
        setWorkspaceError(result.payload || "Unable to load your workspaces.");
        setIsFetching(false);
        return;
      }

      const fetched = result.payload;

      if (Array.isArray(fetched) && fetched.length === 0 && organization?.id) {
        try {
          const token = await getToken();
          await api.post(
            "/api/workspaces",
            {
              organizationId: organization.id,
              name: organization.name,
              slug: organization.slug,
              imageUrl: organization.imageUrl,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const refreshed = await dispatch(fetchWorkspaces({ getToken }));
          if (fetchWorkspaces.rejected.match(refreshed)) {
            throw new Error(refreshed.payload || "Unable to reload workspaces");
          }
        } catch (error) {
          console.error("createWorkspace error:", error);
          setWorkspaceError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to sync your organization.",
          );
        }
      }

      setIsFetching(false);
    };

    syncWorkspace();
  }, [
    areMembershipsLoaded,
    dispatch,
    firstOrganizationId,
    getToken,
    isLoaded,
    organization?.id,
    syncAttempt,
    user?.id,
  ]);

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
        {workspaceError ? (
          <div className="max-w-md rounded-lg border border-red-300 bg-white p-6 text-center dark:border-red-900 dark:bg-zinc-900">
            <p className="text-sm text-red-700 dark:text-red-300">
              Workspace sync failed: {workspaceError}
            </p>
            <button
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              onClick={() => setSyncAttempt((attempt) => attempt + 1)}
            >
              Retry
            </button>
          </div>
        ) : firstOrganizationId ? (
          <Loader2Icon className="size-7 animate-spin" />
        ) : (
          <CreateOrganization skipInvitationScreen={true} />
        )}
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
