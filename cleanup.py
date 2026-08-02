import shutil
import os

base = r"c:\Users\Chinmay\Desktop\StudySphere\studysphere"

# 1. Stub landing components
for f in ["Hero.tsx", "Features.tsx", "Footer.tsx", "CTA.tsx", "HowItWorks.tsx", "Testimonials.tsx"]:
    p = os.path.join(base, "components", "landing", f)
    if os.path.exists(p):
        os.remove(p)
        print(f"Deleted: {p}")

# 2. Stub component folders
for folder in ["chat", "flashcards", "mindmaps", "notes", "planner", "quizzes", "upload", "dashboard", "common", "layout"]:
    p = os.path.join(base, "components", folder)
    if os.path.exists(p):
        shutil.rmtree(p)
        print(f"Deleted folder: {p}")

# 3. Unused services folder
p = os.path.join(base, "services")
if os.path.exists(p):
    shutil.rmtree(p)
    print(f"Deleted folder: {p}")

# 4. Unused store folder
p = os.path.join(base, "store")
if os.path.exists(p):
    shutil.rmtree(p)
    print(f"Deleted folder: {p}")

# 5. Unused hooks (delete all, folder stays empty — we'll remove it)
p = os.path.join(base, "hooks")
if os.path.exists(p):
    shutil.rmtree(p)
    print(f"Deleted folder: {p}")

# 6. Unused types folder
p = os.path.join(base, "types")
if os.path.exists(p):
    shutil.rmtree(p)
    print(f"Deleted folder: {p}")

# 7. Unused lib files (keep utils.ts)
for f in ["api.ts", "auth.ts", "constants.ts", "validators.ts"]:
    p = os.path.join(base, "lib", f)
    if os.path.exists(p):
        os.remove(p)
        print(f"Deleted: {p}")

# Remove lib/.gitkeep if exists
p = os.path.join(base, "lib", ".gitkeep")
if os.path.exists(p):
    os.remove(p)
    print(f"Deleted: {p}")

# 8. Empty constants folder
p = os.path.join(base, "constants")
if os.path.exists(p):
    shutil.rmtree(p)
    print(f"Deleted folder: {p}")

# 9. Empty public subdirectories (icons, illustrations, images, logos)
for folder in ["icons", "illustrations", "images", "logos"]:
    p = os.path.join(base, "public", folder)
    if os.path.exists(p):
        shutil.rmtree(p)
        print(f"Deleted folder: {p}")

# 10. Scattered .gitkeep files
for gk in [
    os.path.join(base, "components", ".gitkeep"),
    os.path.join(base, "public", ".gitkeep"),
]:
    if os.path.exists(gk):
        os.remove(gk)
        print(f"Deleted: {gk}")

# 11. Remove utils folder if empty
p = os.path.join(base, "utils")
if os.path.exists(p) and not os.listdir(p):
    shutil.rmtree(p)
    print(f"Deleted empty folder: {p}")

print("\n✅ Cleanup complete!")
