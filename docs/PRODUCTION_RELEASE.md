# Production website release

Build from the reviewed commit using Python's standard library:

```powershell
python scripts/build_release.py --analytics off --output C:/path/to/empty/mindago-release
```

Deploy only that output to the existing `mindago-website` Pages project, branch `main`, with the exact source commit recorded. The build copies public files only, excludes repository/QA/tooling files, removes the optional GA4 loader from every HTML page, and prints a SHA-256 manifest. It does not alter purchase URLs, prices or policy content. Keep GA4 off until its separate configuration/privacy approval.

Automatic production branch deployments were paused for the controlled cutover; automatic preview builds remain enabled. Retain deployment `f3c2027a-0782-4ca6-9a9a-67c17a3d3070` for rollback. On a regression, close reserved Checkout first if necessary, preserve all financial records and legacy fulfillment, and restore the retained Pages deployment.

To restore automatic production deployments safely, first configure the existing Pages production build command as `python3 scripts/build_release.py --analytics off --output dist` and output directory `dist`. Confirm a reviewed preview built with those same settings contains no analytics loaders and all public pages/assets pass. Then enable only the production-branch automatic-deployment checkbox, retaining preview settings. Do not enable automatic builds with the old blank build command/output `.` while GA4 must remain off. A later analytics-on release needs separate approval.
