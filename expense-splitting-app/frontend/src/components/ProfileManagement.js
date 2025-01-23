import React, { useState, useEffect } from "react";

const ProfileManagement = () => {
  const [full_name, setName] = useState("");
  const [profile_image_url, setProfileImage] = useState(""); // To store the image URL or image data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // To show success message
  const [previewImage, setPreviewImage] = useState(""); // For image preview

  // Fetch existing profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token");

        if (!token) {
          setError("Authentication token is missing!");
          return;
        }

        const response = await fetch("http://127.0.0.1:5000/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setName(data.full_name || "");
        
        setProfileImage(data.profile_image_url || "");
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProfile();
  }, []);

  // Update the user's profile
  const handleProfileUpdate = async () => {
    // Validation
    if (!full_name) {
      setError("Full Name is required!");
      return;
    }

    try {
      setLoading(true);
      setError(null); // Reset error on each update attempt
      setSuccessMessage(null); // Reset success message

      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (!token) {
        setError("Authentication token is missing!");
        return;
      }

      const formData = new FormData();
      formData.append("full_name", full_name);

      // If there's a profile image, append it to the form data
      if (profile_image_url) {
        formData.append("profile_image", profile_image_url);
      }

      const response = await fetch("http://127.0.0.1:5000/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Profile update failed!");
      }

      const data = await response.json();
      setSuccessMessage("Profile updated successfully!");
      setName(data.full_name); // Optionally update the fields with the returned data
      setProfileImage(data.profile_image_url);
      setPreviewImage(""); // Reset image preview after successful update
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle the profile image change (when the user selects an image)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // Set the preview image URL
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Profile Management</h2>

      {/* Success Message */}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      {/* Name Input */}
      <div>
        <label htmlFor="full_name" className="block font-medium">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          value={full_name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Profile Image Input */}
      <div>
        <label htmlFor="profile_image_url" className="block font-medium">
          Profile Image
        </label>
        <input
          id="profile_image_url"
          type="file"
          onChange={handleImageChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {previewImage && (
          <div className="mt-2">
            <img
              src={previewImage}
              alt="Profile Preview"
              className="w-32 h-32 object-cover rounded-md"
            />
          </div>
        )}
      </div>

      {/* Display any error messages */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Update Button */}
      <button
        onClick={handleProfileUpdate}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
        disabled={loading} // Disable button during API call
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </div>
  );
};

export default ProfileManagement;
