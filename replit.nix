{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript
    pkgs.yarn
    pkgs.replitPackages.jest
    pkgs.python310
    pkgs.python310Packages.pip
    pkgs.python310Packages.requests
    pkgs.python310Packages.beautifulsoup4
  ];
}

