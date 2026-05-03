import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!mounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            // 🔥 STOP LOADING IMMEDIATELY (important)
            setLoading(false);

            // 🔥 LOAD ROLE IN BACKGROUND (non-blocking)
            if (currentUser) {
                supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", currentUser.id)
                    .maybeSingle()
                    .then(({ data }) => {
                        if (data?.role) {
                            setRole(data.role.toLowerCase());
                        }
                    });
            }
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", currentUser.id)
                        .maybeSingle()
                        .then(({ data }) => {
                            if (data?.role) {
                                setRole(data.role.toLowerCase());
                            }
                        });
                } else {
                    setRole("user");
                }
            }
        );

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);