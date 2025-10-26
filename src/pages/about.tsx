import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updatePageState } from "../redux/slicePage";

export default function About() {
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(updatePageState({
            navItems: [
                {icon: "Info", link: "./"},
            ],
            title: "about"
        }));
    }, [dispatch]);
    
    return (
        <div>
            <h1>ABOUT</h1>
        </div>
    );
}