VERSION=v$(node -p -e "require('./package.json').version")

# Check if the package version is already published
if git rev-parse $VERSION >/dev/null 2>&1; then
  echo "Version $VERSION already published"
  exit 1
fi

yarn build
git add --all
git commit -m "feat(release): release $VERSION" --allow-empty
git tag $VERSION -m "feat(release): release $VERSION"
git push --follow-tags